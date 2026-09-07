import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  NgxToast,
  NgxToastPosition,
  NgxToastService,
  NgxToastType,
  ToastCenterComponent,
} from '@angular-magic/ngx-toast';

/** Types the demo can raise. NgxToastService has no `none()` shorthand. */
type DemoToastType = Exclude<NgxToastType, NgxToastType.none>;

const CUSTOM_ICON = 'assets/bell.svg';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    ToastCenterComponent,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly title = 'ngx-toast';
  readonly NgxToastType = NgxToastType;
  readonly timeoutOptions: readonly number[] = [1000, 3000, 10000, Infinity];
  readonly positions: readonly NgxToastPosition[] = Object.values(NgxToastPosition);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly addOnBlur = true;

  readonly messages = signal<string[]>(['First message', 'Second message']);

  private readonly ngxToastService = inject(NgxToastService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly form = this.formBuilder.group({
    title: ['Notification'],
    message: ['My message will be here'],
    type: [NgxToastType.success as DemoToastType],
    position: [NgxToastPosition.TOP_RIGHT],
    timeout: [3000],
    color: [''],
    multipleMessages: [false],
    customIcon: [false],
    enableOnClick: [false],
    enableOnDestroy: [false],
    enableOnClosed: [false],
    showProgress: [true],
    enableStack: [false],
  });

  readonly multipleMessages = toSignal(this.form.controls.multipleMessages.valueChanges, {
    initialValue: this.form.controls.multipleMessages.value,
  });

  show(): void {
    const raw = this.form.getRawValue();

    this.ngxToastService.maxUnstackedToast.set(raw.enableStack ? 3 : 100);
    this.ngxToastService.displayProgressBar.set(raw.showProgress);
    this.ngxToastService.setPosition(raw.position);
    this.ngxToastService.setCustomIcons({
      [NgxToastType.success]: raw.customIcon ? CUSTOM_ICON : undefined,
    });

    const config: Omit<NgxToast, 'type'> = {
      title: raw.title,
      messages: raw.multipleMessages ? this.messages() : [raw.message],
      delay: raw.timeout,
      click: () => {
        if (raw.enableOnClick) {
          alert('Do something on toast click!');
        }
      },
      destroy: () => {
        if (raw.enableOnDestroy) {
          alert('Do something when toast is destroyed!');
        }
      },
      close: () => {
        if (raw.enableOnClosed) {
          alert('Do something when toast is closed!');
        }
      },
    };

    if (raw.color) {
      config.color = raw.color;
    }

    this.raise(raw.type, config);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.messages.update(messages => [...messages, value]);
    }

    event.chipInput!.clear();
  }

  remove(message: string): void {
    this.messages.update(messages => messages.filter(item => item !== message));
  }

  edit(message: string, event: MatChipEditedEvent): void {
    const value = event.value.trim();

    if (!value) {
      this.remove(message);
      return;
    }

    this.messages.update(messages => messages.map(item => (item === message ? value : item)));
  }

  private raise(type: DemoToastType, config: Omit<NgxToast, 'type'>): void {
    switch (type) {
      case NgxToastType.success:
        this.ngxToastService.success(config);
        break;
      case NgxToastType.error:
        this.ngxToastService.error(config);
        break;
      case NgxToastType.warning:
        this.ngxToastService.warning(config);
        break;
      case NgxToastType.info:
        this.ngxToastService.info(config);
        break;
    }
  }
}

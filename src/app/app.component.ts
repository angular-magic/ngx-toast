import { Component, OnInit } from '@angular/core';
import { NgxToast, NgxToastPosition, NgxToastService, NgxToastType } from "@angular-magic/ngx-toast";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatChipEditedEvent, MatChipInputEvent } from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngx-toast';
  form: FormGroup;
  NgxToastType: typeof NgxToastType = NgxToastType;
  timeoutOptions: number[] = [1000, 3000, 10000, Infinity];
  positions: string[] = Object.keys(NgxToastPosition).map(key => NgxToastPosition[key]);
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  messages: string[] = ['First message', 'Second message'];

  constructor(
    private ngxToastService: NgxToastService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  show(): void {
    this.ngxToastService.maxUnstackedToast = this.form.value.enableStack ? 3 : 100;

    this.ngxToastService.setPosition(this.form.value.position);
    this.ngxToastService.displayProgressBar = this.form.value.showProgress;
    let messages = [this.form.value.message];

    if (this.form.value.multipleMessages) {
      messages = this.messages;
    }

    const config: Partial<NgxToast> = {
      title: this.form.value.title,
      messages,
      delay: this.form.value.timeout,
      click: () => {
        if (this.form.value.enableOnClick) {
          alert('Do something on toast click!');
        }
      },
      destroy: () => {
        if (this.form.value.enableOnDestroy) {
          alert('Do something when toast is destroyed!');
        }
      },
      close: () => {
        if (this.form.value.enableOnClosed) {
          alert('Do something when toast is closed!');
        }
      },
    }

    if (this.form.value.color) {
      config.color = this.form.value.color;
    }

    this.ngxToastService[this.form.value.type](config);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.messages.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(message: string): void {
    const index = this.messages.findIndex(item => item === message);

    if (index >= 0) {
      this.messages.splice(index, 1);
    }
  }

  edit(message: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(message);
      return;
    }

    // Edit existing fruit
    const index = this.messages.findIndex(item => item === message);
    if (index >= 0) {
      this.messages[index] = value;
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      title: ['Notification'],
      message: ['My message will be here'],
      type: [NgxToastType.success],
      position: [NgxToastPosition.TOP_RIGHT],
      timeout: [3000],
      color: [null],
      multipleMessages: [false],
      enableOnClick: [false],
      enableOnDestroy: [false],
      enableOnClosed: [false],
      showProgress: [true],
      enableStack: [false],
    })
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  resource,
  signal,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import { NgxToast } from '../base/toast.model';
import { NgxToastType } from '../base/toast-type.enum';
import { NgxToastIconRegistry } from '../icons/toast-icon-registry';
import { NgxToastService } from '../toast.service';

@Component({
  selector: 'ngx-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  host: {
    '[style.--ngx-toast-delay]': 'delayCss()',
    '[style.--ngx-toast-color]': 'resolvedColor()',
  },
})
export class ToastComponent implements OnInit, AfterViewInit {
  readonly toast = input.required<NgxToast>();
  readonly isStackToast = input(false);
  readonly color = input<string | undefined>(undefined);
  readonly delay = input(3000);
  readonly displayProgressBar = input(true);

  readonly clicked = output<NgxToast>();
  readonly destroyed = output<NgxToast>();
  readonly closed = output<NgxToast>();
  readonly showStacked = output<void>();

  protected readonly isOpened = signal(false);
  protected readonly isInfinity = computed(() => this.delay() === Infinity);
  protected readonly NgxToastType = NgxToastType;

  protected readonly resolvedColor = computed(
    () => this.color() || this.ngxToastService.typeColor()[this.toast().type],
  );

  protected readonly delayCss = computed(() => (this.isInfinity() ? null : `${this.delay()}ms`));

  /** Undefined icon means the loader never runs and the built-in sprite is used. */
  protected readonly customIcon = resource<SafeHtml | null, string | undefined>({
    params: () => this.toast().icon,
    loader: ({ params, abortSignal }) => this.icons.load(params, abortSignal),
    defaultValue: null,
  });

  private static readonly DELAY_ON_CLICK = 400;

  private readonly ngxToastService = inject(NgxToastService);
  private readonly icons = inject(NgxToastIconRegistry);

  private closeTimeout?: ReturnType<typeof setTimeout>;
  private destroyTimeout?: ReturnType<typeof setTimeout>;
  private referencePointTimestamp = 0;
  private mouseEnterTimestamp = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  ngOnInit(): void {
    this.referencePointTimestamp = performance.now();
    this.autoSelfDestroy(this.delay());
  }

  ngAfterViewInit(): void {
    // Deferring by a frame is what lets the opacity transition run instead of being painted open.
    setTimeout(() => this.isOpened.set(true));
  }

  mouseEnter(): void {
    this.mouseEnterTimestamp = performance.now();

    this.clearTimers();
  }

  mouseLeave(): void {
    const timestampGap = this.mouseEnterTimestamp - this.referencePointTimestamp;

    this.autoSelfDestroy(this.delay() - timestampGap);
    this.referencePointTimestamp = performance.now() - timestampGap;
  }

  toastClick(): void {
    const toast = this.toast();

    this.clicked.emit(toast);
    toast.click?.(toast);
  }

  close(): void {
    this.isOpened.set(false);

    setTimeout(() => {
      const toast = this.toast();

      toast.close?.(toast);
      this.closed.emit(toast);
    }, ToastComponent.DELAY_ON_CLICK);
  }

  private autoSelfDestroy(delay: number): void {
    if (this.delay() === Infinity) {
      return;
    }

    this.closeTimeout = setTimeout(() => this.isOpened.set(false), delay);

    this.destroyTimeout = setTimeout(() => {
      const toast = this.toast();

      this.destroyed.emit(toast);
      toast.destroy?.(toast);
    }, delay + ToastComponent.DELAY_ON_CLICK);
  }

  private clearTimers(): void {
    clearTimeout(this.closeTimeout);
    clearTimeout(this.destroyTimeout);
  }
}

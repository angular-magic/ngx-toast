import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';

import { NgxToast } from '../base/toast.model';
import { NgxToastType } from '../base/toast-type.enum';
import { ToastComponent } from '../toast/toast.component';
import { NgxToastService } from '../toast.service';

@Component({
  selector: 'ngx-toast-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastComponent],
  templateUrl: './toast-center.component.html',
  styleUrl: './toast-center.component.scss',
})
export class ToastCenterComponent {
  protected readonly ngxToastService = inject(NgxToastService);

  protected readonly toasts = this.ngxToastService.toasts;
  protected readonly position = this.ngxToastService.position;
  protected readonly displayProgressBar = this.ngxToastService.displayProgressBar;

  /** Expansion survives while toasts are on screen and resets once the list empties. */
  private readonly isExpanded = linkedSignal<readonly NgxToast[], boolean>({
    source: this.toasts,
    computation: (toasts, previous) => (toasts.length ? previous?.value ?? false : false),
  });

  protected readonly isStacked = computed(
    () => !this.isExpanded() && this.toasts().length >= this.ngxToastService.maxUnstackedToast(),
  );

  /** Former `toastAvailable` pipe. Deliberately a separate check from {@link isStacked}. */
  protected readonly isAvailable = computed(
    () => this.toasts().length <= this.ngxToastService.maxUnstackedToast(),
  );

  /**
   * Both branches are read unconditionally: `||` would short-circuit past {@link isStacked}
   * whenever the list is short, and {@link isExpanded} would then never see the list empty and
   * never reset. The result is the same boolean the two conditions produced before.
   */
  protected readonly showAll = computed(() => {
    const isAvailable = this.isAvailable();
    const isStacked = this.isStacked();

    return isAvailable || !isStacked;
  });

  protected readonly stackToast = computed<NgxToast>(() => ({
    type: NgxToastType.none,
    title: this.ngxToastService.typeTitles()[NgxToastType.none],
    messages: [this.ngxToastService.stackNotificationCTA()],
  }));

  show(): void {
    this.isExpanded.set(true);
  }

  remove(item: NgxToast): void {
    this.ngxToastService.close(item);
  }

  clear(): void {
    this.ngxToastService.clear();
  }

  protected colorOf(toast: NgxToast): string {
    return toast.color || this.ngxToastService.typeColor()[toast.type];
  }

  protected delayOf(toast: NgxToast): number {
    return toast.delay || this.ngxToastService.typeDelays()[toast.type];
  }
}

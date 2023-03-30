import { Component } from '@angular/core';
import { NgxToast } from "../base/toast.model";
import { NgxToastService } from "../toast.service";
import { Observable, tap } from "rxjs";
import { NgxToastType } from "../base/toast-type.enum";

@Component({
  selector: 'ngx-toast-center',
  templateUrl: './toast-center.component.html',
  styleUrls: ['./toast-center.component.scss']
})
export class ToastCenterComponent {
  toasts$: Observable<NgxToast[]>;
  isStacked: boolean = false;
  stackToast: NgxToast = {
    type: NgxToastType.none,
    title: this.ngxToastService.typeTitles[NgxToastType.none],
    messages: [this.ngxToastService.stackNotificationCTA]
  };
  private isExpanded: boolean = false;

  constructor(
    public readonly ngxToastService: NgxToastService,
  ) {
    this.toasts$ = this.ngxToastService.getToasts()
      .pipe(tap(result => {
        if (!this.isExpanded) {
          this.isStacked = result.length >= this.ngxToastService.maxUnstackedToast;
        }

        if (!result.length) this.isExpanded = false
      }));
  }

  show(): void {
    this.isStacked = false;
    this.isExpanded = true;
  }

  remove(item: NgxToast): void {
    this.ngxToastService.close(item);
  }

  clear(): void {
    this.ngxToastService.clear();
  }
}

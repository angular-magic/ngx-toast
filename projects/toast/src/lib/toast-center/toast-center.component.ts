import { Component } from '@angular/core';
import { NgxToast } from "../base/toast.model";
import { NgxToastService } from "../toast.service";
import { Observable } from "rxjs";

@Component({
  selector: 'ngx-toast-center',
  templateUrl: './toast-center.component.html',
  styleUrls: ['./toast-center.component.scss']
})
export class ToastCenterComponent {
  toasts$: Observable<NgxToast[]>;

  constructor(
    public readonly ngxToastService: NgxToastService,
  ) {
    this.toasts$ = this.ngxToastService.getToasts();
  }

  remove(item: NgxToast): void {
    this.ngxToastService.close(item);
  }
}

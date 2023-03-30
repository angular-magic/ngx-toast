import { Pipe, PipeTransform } from '@angular/core';
import { NgxToast } from '../base/toast.model';
import { NgxToastService } from "../toast.service";

@Pipe({
  name: 'toastAvailable',
})
export class ToastAvailablePipe implements PipeTransform {
  constructor(
    private ngxToastService: NgxToastService
  ) {
  }

  public transform(toasts: NgxToast[]): boolean {
    return toasts && toasts?.length <= this.ngxToastService.maxUnstackedToast;
  }
}

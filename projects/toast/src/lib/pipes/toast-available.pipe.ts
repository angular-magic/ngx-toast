import { Pipe, PipeTransform } from '@angular/core';
import { NgxToast } from '../base/toast.model';

@Pipe({
  name: 'toastAvailable',
})
export class ToastAvailablePipe implements PipeTransform {
  public transform(
    toasts: NgxToast[],
    stockedNumber: number,
  ): boolean {
    return toasts && toasts.length <= stockedNumber;
  }
}

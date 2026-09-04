import { NgModule } from '@angular/core';

import { ToastCenterComponent } from './toast-center/toast-center.component';
import { ToastComponent } from './toast/toast.component';

/**
 * Compatibility shim for NgModule-based applications. Standalone applications can import
 * {@link ToastCenterComponent} directly instead.
 */
@NgModule({
  imports: [ToastComponent, ToastCenterComponent],
  exports: [ToastComponent, ToastCenterComponent],
})
export class NgxToastModule {
}

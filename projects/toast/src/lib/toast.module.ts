import { NgModule } from '@angular/core';
import { ToastComponent } from "./toast/toast.component";
import { CommonModule } from "@angular/common";
import { ToastAvailablePipe } from "./pipes/toast-available.pipe";
import { ToastCenterComponent } from './toast-center/toast-center.component';
import { HttpClientModule } from "@angular/common/http";
import { ToastCustomIconPipe } from "./pipes/toast-custom-icon.pipe";

@NgModule({
  declarations: [
    ToastComponent,
    ToastAvailablePipe,
    ToastCustomIconPipe,
    ToastCenterComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    ToastComponent,
    ToastCenterComponent
  ]
})
export class NgxToastModule {
}

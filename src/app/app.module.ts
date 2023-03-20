import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxToastModule } from "@angular-magic/ngx-toast";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxToastModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

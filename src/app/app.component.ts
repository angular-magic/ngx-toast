import { Component, OnInit } from '@angular/core';
import { NgxToast } from "../../projects/toast/src/lib/base/toast.model";
import { NgxToastService } from "@angular-magic/ngx-toast";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngx-toast';

  constructor(private ngxToastService: NgxToastService) {
  }

  ngOnInit(): void {
    this.ngxToastService.success({ title: 'Success', messages: ['User was successfully updated!'] });
    this.ngxToastService.error({
      title: 'Success', messages: ['User was successfully updated!', 'User was successfully updated!'],
      click(item: NgxToast) {
        console.log(item);
      },
      destroy(item: NgxToast) {
        console.log('destroyes');
      }
    });
    this.ngxToastService.warning({ title: 'Success', messages: ['User was successfully updated!'] });
    this.ngxToastService.info({ title: 'Success', messages: ['User was successfully updated!'] });
  }
}

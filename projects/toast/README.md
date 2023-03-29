# ngx-toast
<p align="center">
  <img alt="Ngx-Markdown Logo" src="https://ngx-validator.angularmagic.com/assets/cover.png">
</p>

**Demo: https://ngx-toast.angularmagic.com**

This module contain Angular Toast/Notification functionality, which you can use instantly after installation, and then you can customize it.

[![NPM](https://nodei.co/npm/@angular-magic/ngx-toast.png)](https://nodei.co/npm/@angular-magic/ngx-toast/)

# Installation
#### npm
```
npm install @angular-magic/ngx-toast
```


# Integration
1. Import NgxToastModule into your application module

```ts
import { NgxToastModule } from "@angular-magic/ngx-toast";

@NgModule({
  imports: [
    NgxToastModule,
    BrowserModule,
    FormsModule,
    ...],
  ....
})
```

2. Add toast center in your app component
```
<ngx-toast-center></ngx-toast-center>
```
3. Now you can inject `NgxToastService` and use standard types of notification (success, error, warning & info) or use `open` method to create your custom notification.

```ts
import { NgxToastService } from "@angular-magic/toast.service";

constructor(
  private ngxToastService: NgxToastService
) {
    this.ngxToastService.success({title: 'Success', messages: ['User successfully updated!']})
}
```

# GitHub
Please feel free to declare issues or contribute: https://github.com/angular-magic/ngx-toast

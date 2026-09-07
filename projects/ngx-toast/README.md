# ngx-toast
<p align="center">
  <img alt="Ngx-Toast Logo" src="https://ngx-toast.angularmagic.com/assets/cover.png">
</p>

**Demo: https://ngx-toast.angularmagic.com**

This module contain Angular Toast/Notification functionality, which you can use instantly after installation, and then you can customize it.

[![NPM](https://nodei.co/npm/@angular-magic/ngx-toast.png)](https://nodei.co/npm/@angular-magic/ngx-toast/)

# Versioning
The library's major version tracks the Angular major it supports, so `22.x` targets Angular 22.
For Angular 15 and older, use `1.2.x`.

# Installation
#### npm
```
npm install @angular-magic/ngx-toast
```

# Integration
1. Add the toast center to your root component's template. It renders every notification and
   positions itself according to the service configuration.

```html
<ngx-toast-center></ngx-toast-center>
```

2. Import `ToastCenterComponent` where you use it. It is standalone, so no module is required:

```ts
import { ToastCenterComponent } from "@angular-magic/ngx-toast";

@Component({
  selector: 'app-root',
  imports: [ToastCenterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
}
```

NgModule-based applications can keep importing `NgxToastModule` instead:

```ts
import { NgxToastModule } from "@angular-magic/ngx-toast";

@NgModule({
  imports: [NgxToastModule, BrowserModule, FormsModule],
})
export class AppModule {
}
```

3. Inject `NgxToastService` and use the standard notification types (`success`, `error`, `warning`
   and `info`), or `open` to create your own.

```ts
import { inject } from "@angular/core";
import { NgxToastService } from "@angular-magic/ngx-toast";

export class UserComponent {
  private readonly ngxToastService = inject(NgxToastService);

  save(): void {
    this.ngxToastService.success({ title: 'Success', messages: ['User successfully updated!'] });
  }
}
```

# Configuration
Defaults are exposed as signals, so changes take effect immediately even while notifications are
already on screen:

```ts
this.ngxToastService.displayProgressBar.set(false);
this.ngxToastService.maxUnstackedToast.set(5);
this.ngxToastService.stackNotificationCTA.set('Show all notifications');
```

There are also helpers for the per-type defaults, which merge into the existing configuration:

```ts
this.ngxToastService.setPosition(NgxToastPosition.TOP_LEFT);
this.ngxToastService.setCustomColors({ [NgxToastType.success]: '#00CC69' });
this.ngxToastService.setCustomDelays({ [NgxToastType.success]: 5000 });   // Infinity to never dismiss
this.ngxToastService.setCustomTitle({ [NgxToastType.success]: 'Done' });
this.ngxToastService.setCustomIcons({ [NgxToastType.success]: 'assets/check.svg' });
```

Custom icons are fetched with `fetch`, cached per URL, and sanitized before rendering: scripts,
event handlers and references that leave the document are stripped. If an icon fails to load, the
built-in icon for that type is used instead. The library does not depend on `HttpClient`, so no
`provideHttpClient()` setup is required.

Read the current notifications either as a signal or as an observable:

```ts
this.ngxToastService.toasts();       // Signal<NgxToast[]>
this.ngxToastService.getToasts();    // Observable<NgxToast[]>
```

# Upgrading from 1.x
- Angular 22 is required, and `@angular/platform-browser` is now a declared peer dependency.
- Configuration fields are signals: `service.displayProgressBar = false` becomes
  `service.displayProgressBar.set(false)`, and reads such as `service.typeColor[type]` become
  `service.typeColor()[type]`. The `setCustomIcons` / `setCustomColors` / `setCustomDelays` /
  `setCustomTitle` / `setPosition` helpers are unchanged.
- `typeIcons` is now `Partial<Record<NgxToastType, string>>` and starts empty, so reads are
  `string | undefined`.
- The library no longer imports `HttpClientModule`. If your application relied on it being
  provided transitively, add `provideHttpClient()` yourself.
- `success`/`error`/`warning`/`info` no longer discard a caller-supplied `icon`.
- Components are standalone and zoneless-compatible; `NgxToastModule` remains as a compatibility
  shim. `ToastComponent` uses signal inputs, so programmatic creation needs `setInput()`.

# GitHub
Please feel free to declare issues or contribute: https://github.com/angular-magic/ngx-toast

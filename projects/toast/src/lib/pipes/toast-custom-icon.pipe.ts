import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { map, Observable } from "rxjs";

@Pipe({
  name: 'toastCustomIcon',
})
export class ToastCustomIconPipe implements PipeTransform {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly sanitizer: DomSanitizer,
  ) {
  }

  public transform(
    value: string,
  ): Observable<SafeHtml> {
    return this.httpClient
      .get(value, { responseType: 'text' })
      .pipe(map(value => this.sanitizer.bypassSecurityTrustHtml(value)));
  }
}

import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { sanitizeSvg } from './sanitize-svg';

/**
 * Loads custom toast icons over `fetch` and caches them by URL, so the same icon is fetched
 * once per application rather than once per toast.
 *
 * The library deliberately does not depend on `HttpClient`: consumers should not have to call
 * `provideHttpClient()` to display a notification.
 */
@Injectable({
  providedIn: 'root',
})
export class NgxToastIconRegistry {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cache = new Map<string, Promise<SafeHtml | null>>();

  /**
   * Resolves to the sanitized icon, or to null on any failure so the caller can fall back to
   * the built-in sprite. Only ever rejects when `abortSignal` fires.
   */
  load(url: string, abortSignal?: AbortSignal): Promise<SafeHtml | null> {
    // On the server there is no fetch target and no point transferring remote markup into the
    // serialized page; the client re-resolves the icon after hydration.
    if (!this.isBrowser) {
      return Promise.resolve(null);
    }

    const cached = this.cache.get(url);

    if (cached) {
      return cached;
    }

    const pending = this.fetchIcon(url, abortSignal).catch((error: unknown) => {
      // A network blip should not poison the entry for the lifetime of the app.
      this.cache.delete(url);

      if (abortSignal?.aborted) {
        throw error;
      }

      return null;
    });

    this.cache.set(url, pending);

    return pending;
  }

  private async fetchIcon(url: string, abortSignal?: AbortSignal): Promise<SafeHtml | null> {
    const response = await fetch(url, { signal: abortSignal });

    if (!response.ok) {
      return null;
    }

    const markup = sanitizeSvg(await response.text());

    // The bypass is safe only because the markup went through sanitizeSvg first: Angular's own
    // HTML sanitizer has no SVG elements in its allowlist and would strip the icon entirely.
    return markup === null ? null : this.sanitizer.bypassSecurityTrustHtml(markup);
  }
}

import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NgxToastIconRegistry } from './toast-icon-registry';

const SVG = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';

function okResponse(body = SVG): Response {
  return { ok: true, text: () => Promise.resolve(body) } as Response;
}

describe('NgxToastIconRegistry', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  function registry(platform: string = 'browser'): NgxToastIconRegistry {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });

    return TestBed.inject(NgxToastIconRegistry);
  }

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('returns sanitized markup for a successful response', async () => {
    await expect(registry().load('assets/bell.svg')).resolves.not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // The old pipe issued one HTTP GET per toast for the same URL.
  it('fetches a given URL only once', async () => {
    const icons = registry();

    await Promise.all([icons.load('assets/bell.svg'), icons.load('assets/bell.svg')]);
    await icons.load('assets/bell.svg');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetches each distinct URL separately', async () => {
    const icons = registry();

    await icons.load('assets/a.svg');
    await icons.load('assets/b.svg');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('resolves null for a non-ok response', async () => {
    fetchMock.mockResolvedValue({ ok: false, text: () => Promise.resolve('') } as Response);

    await expect(registry().load('assets/missing.svg')).resolves.toBeNull();
  });

  it('resolves null for markup that is not an SVG', async () => {
    fetchMock.mockResolvedValue(okResponse('<html>404</html>'));

    await expect(registry().load('assets/wrong.svg')).resolves.toBeNull();
  });

  it('resolves null on a network failure and lets a later call retry', async () => {
    const icons = registry();
    fetchMock.mockRejectedValueOnce(new Error('offline'));

    await expect(icons.load('assets/bell.svg')).resolves.toBeNull();

    fetchMock.mockResolvedValue(okResponse());
    await expect(icons.load('assets/bell.svg')).resolves.not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never fetches on the server', async () => {
    await expect(registry('server').load('assets/bell.svg')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

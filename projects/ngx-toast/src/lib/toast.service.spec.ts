import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NgxToastPosition } from './base/toast-position.enum';
import { NgxToastType } from './base/toast-type.enum';
import { NgxToastService } from './toast.service';

describe('NgxToastService', () => {
  let service: NgxToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ships defaults for every configuration signal', () => {
    expect(service.typeColor()[NgxToastType.success]).toBe('#00CC69');
    expect(service.typeDelays()[NgxToastType.none]).toBe(5000);
    expect(service.typeTitles()[NgxToastType.error]).toBe('Failure');
    expect(service.typeIcons()).toEqual({});
    expect(service.displayProgressBar()).toBe(true);
    expect(service.maxUnstackedToast()).toBe(3);
    expect(service.position()).toEqual({ top: '20px', right: '20px' });
  });

  it('merges custom configuration over the defaults instead of replacing it', () => {
    service.setCustomColors({ [NgxToastType.success]: '#0f0' });
    service.setCustomDelays({ [NgxToastType.info]: 9000 });
    service.setCustomTitle({ [NgxToastType.info]: 'Heads up' });
    service.setCustomIcons({ [NgxToastType.error]: 'assets/boom.svg' });

    expect(service.typeColor()[NgxToastType.success]).toBe('#0f0');
    expect(service.typeColor()[NgxToastType.error]).toBe('#FE355A');
    expect(service.typeDelays()[NgxToastType.info]).toBe(9000);
    expect(service.typeDelays()[NgxToastType.warning]).toBe(3000);
    expect(service.typeTitles()[NgxToastType.info]).toBe('Heads up');
    expect(service.typeIcons()).toEqual({ [NgxToastType.error]: 'assets/boom.svg' });
  });

  it.each([
    [NgxToastPosition.TOP_RIGHT, { top: '20px', right: '20px' }],
    [NgxToastPosition.TOP_CENTER, { top: '20px', right: '50%', transform: 'translateX(50%)' }],
    [NgxToastPosition.TOP_LEFT, { top: '20px', left: '20px' }],
    [NgxToastPosition.BOTTOM_RIGHT, { bottom: '20px', right: '20px' }],
    [NgxToastPosition.BOTTOM_CENTER, { bottom: '20px', right: '50%', transform: 'translateX(50%)' }],
    [NgxToastPosition.BOTTOM_LEFT, { bottom: '20px', left: '20px' }],
  ])('maps %s to its style record', (position, expected) => {
    service.setPosition(position);

    expect(service.position()).toEqual(expected);
  });

  it('assigns an id on open and keeps a caller-supplied one', () => {
    service.open({ type: NgxToastType.info, messages: ['generated'] });
    service.open({ type: NgxToastType.info, messages: ['explicit'], id: 'mine' });

    const [generated, explicit] = service.toasts();

    expect(generated.id).toEqual(expect.any(Number));
    expect(explicit.id).toBe('mine');
  });

  it('applies the type default title and lets the caller override it', () => {
    service.success({ messages: ['a'] });
    service.success({ messages: ['b'], title: 'Custom' });

    expect(service.toasts()[0].title).toBe('Success');
    expect(service.toasts()[1].title).toBe('Custom');
  });

  it.each([
    ['success', NgxToastType.success],
    ['error', NgxToastType.error],
    ['warning', NgxToastType.warning],
    ['info', NgxToastType.info],
  ] as const)('%s() raises a toast of the matching type', (method, type) => {
    service[method]({ messages: ['x'] });

    expect(service.toasts()[0].type).toBe(type);
  });

  // Regression: `icon` used to sit after the `...toast` spread, so a caller-supplied icon was
  // silently overwritten by the (null) type default.
  it('keeps a caller-supplied icon instead of overwriting it with the type default', () => {
    service.setCustomIcons({ [NgxToastType.success]: 'assets/check.svg' });
    service.success({ messages: ['x'], icon: 'assets/star.svg' });

    expect(service.toasts()[0].icon).toBe('assets/star.svg');
  });

  it('falls back to the configured type icon, and omits the key when there is none', () => {
    service.success({ messages: ['no icon'] });
    service.setCustomIcons({ [NgxToastType.success]: 'assets/check.svg' });
    service.success({ messages: ['type icon'] });

    expect(service.toasts()[0]).not.toHaveProperty('icon');
    expect(service.toasts()[1].icon).toBe('assets/check.svg');
  });

  it('closes by id and clears everything', () => {
    service.success({ messages: ['a'] });
    service.success({ messages: ['b'] });

    service.close(service.toasts()[0]);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].messages).toEqual(['b']);

    service.clear();
    expect(service.toasts()).toEqual([]);
  });

  // Guards the decision to keep a BehaviorSubject rather than deriving the observable from the
  // signal: toObservable() emits asynchronously, which would break existing subscribers.
  it('getToasts() replays the current value synchronously on subscribe', () => {
    service.success({ messages: ['already here'] });

    let emitted: unknown;
    service.getToasts().subscribe(toasts => (emitted = toasts));

    expect(emitted).toEqual(service.toasts());
  });

  it('getToasts() and the toasts signal stay in step', async () => {
    service.info({ messages: ['x'] });

    await expect(firstValueFrom(service.getToasts())).resolves.toEqual(service.toasts());
  });
});

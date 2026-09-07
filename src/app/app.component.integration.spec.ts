import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxToastPosition, NgxToastService, NgxToastType } from '@angular-magic/ngx-toast';

import { AppComponent } from './app.component';

describe('AppComponent (integration)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let service: NgxToastService;

  // Not fixture.whenStable(): rendered toasts hold pending auto-destroy timers.
  async function flush(): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function toasts(): NodeListOf<HTMLElement> {
    return element().querySelectorAll('ngx-toast');
  }

  function wrapper(): HTMLElement {
    return element().querySelector('.ngx-toast__wrapper')!;
  }

  async function show(): Promise<void> {
    element().querySelector<HTMLButtonElement>('.show button')!.click();
    await flush();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    service = TestBed.inject(NgxToastService);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    await flush();
  });

  it('raises a toast carrying the form title and message', async () => {
    component.form.patchValue({ title: 'Heads up', message: 'Something happened' });
    await show();

    expect(toasts()).toHaveLength(1);
    expect(element().querySelector('.ngx-toast__title')?.textContent).toContain('Heads up');
    expect(element().querySelector('.ngx-toast__message')?.textContent).toContain('Something happened');
  });

  // Guards the switch that replaced `ngxToastService[type](config)` — a dynamic dispatch that
  // would have thrown for NgxToastType.none, which has no matching service method.
  it.each([
    NgxToastType.success,
    NgxToastType.error,
    NgxToastType.warning,
    NgxToastType.info,
  ] as const)('routes %s to the matching service method', async type => {
    component.form.controls.type.setValue(type);
    await show();

    expect(service.toasts()[0].type).toBe(type);
    expect(element().querySelector('.ngx-toast')?.className).toContain(`ngx-toast-${type}`);
  });

  it('renders every seeded message when multiple messages are enabled', async () => {
    component.form.controls.multipleMessages.setValue(true);
    await flush();
    await show();

    const items = element().querySelectorAll('.ngx-toast__message li');
    expect(items).toHaveLength(2);
    expect(Array.from(items, item => item.textContent?.trim())).toEqual([
      'First message',
      'Second message',
    ]);
  });

  it('swaps the single-message input for the chip grid when toggled', async () => {
    expect(element().querySelector('mat-chip-grid')).toBeNull();

    element().querySelector<HTMLElement>('.multiple-switcher button')!.click();
    await flush();

    expect(element().querySelector('mat-chip-grid')).not.toBeNull();
  });

  it('adds, edits and removes messages', () => {
    const chipInput = { clear: vi.fn() };

    component.add({ value: ' Third ', chipInput } as never);
    expect(component.messages()).toEqual(['First message', 'Second message', 'Third']);
    expect(chipInput.clear).toHaveBeenCalled();

    component.edit('Third', { value: 'Renamed' } as never);
    expect(component.messages()).toEqual(['First message', 'Second message', 'Renamed']);

    component.edit('Renamed', { value: '   ' } as never);
    expect(component.messages()).toEqual(['First message', 'Second message']);

    component.remove('First message');
    expect(component.messages()).toEqual(['Second message']);
  });

  it.each([
    [NgxToastPosition.TOP_RIGHT, { top: '20px', right: '20px' }],
    [NgxToastPosition.TOP_CENTER, { top: '20px', right: '50%' }],
    [NgxToastPosition.TOP_LEFT, { top: '20px', left: '20px' }],
    [NgxToastPosition.BOTTOM_RIGHT, { bottom: '20px', right: '20px' }],
    [NgxToastPosition.BOTTOM_CENTER, { bottom: '20px', right: '50%' }],
    [NgxToastPosition.BOTTOM_LEFT, { bottom: '20px', left: '20px' }],
  ])('positions the toast center at %s', async (position, expected) => {
    component.form.controls.position.setValue(position);
    await show();

    for (const [property, value] of Object.entries(expected)) {
      expect(wrapper().style.getPropertyValue(property)).toBe(value);
    }
  });

  it('stacks beyond three toasts only when stacking is enabled', async () => {
    component.form.controls.enableStack.setValue(true);
    for (let i = 0; i < 4; i++) {
      await show();
    }

    expect(toasts()).toHaveLength(1);
    expect(element().querySelector('.ngx-toast__stack-cta')?.textContent)
      .toContain(service.stackNotificationCTA());

    service.clear();
    component.form.controls.enableStack.setValue(false);
    await flush();
    for (let i = 0; i < 4; i++) {
      await show();
    }

    expect(toasts()).toHaveLength(4);
  });

  it('honours the progress bar toggle', async () => {
    await show();
    expect(element().querySelector('.ngx-toast--progress-bar')).not.toBeNull();

    service.clear();
    component.form.controls.showProgress.setValue(false);
    await flush();
    await show();

    expect(element().querySelector('.ngx-toast--progress-bar')).toBeNull();
  });

  it('applies a custom colour over the type colour', async () => {
    component.form.controls.color.setValue('#01B78B');
    await show();

    expect(toasts()[0].style.getPropertyValue('--ngx-toast-color')).toBe('#01B78B');
  });

  it('registers the bell icon only when the custom icon toggle is on', async () => {
    await show();
    expect(service.toasts()[0]).not.toHaveProperty('icon');

    service.clear();
    component.form.controls.customIcon.setValue(true);
    await flush();
    await show();

    expect(service.toasts()[0].icon).toBe('assets/bell.svg');
  });

  it('alerts on click only when the click toggle is on', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    await show();
    element().querySelector<HTMLElement>('.ngx-toast__content')!.click();
    expect(alertSpy).not.toHaveBeenCalled();

    service.clear();
    component.form.controls.enableOnClick.setValue(true);
    await flush();
    await show();
    element().querySelector<HTMLElement>('.ngx-toast__content')!.click();

    expect(alertSpy).toHaveBeenCalledWith('Do something on toast click!');
    alertSpy.mockRestore();
  });
});

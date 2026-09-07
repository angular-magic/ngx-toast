import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { NgxToast } from '../base/toast.model';
import { NgxToastType } from '../base/toast-type.enum';
import { NgxToastIconRegistry } from '../icons/toast-icon-registry';
import { NgxToastService } from '../toast.service';
import { ToastComponent } from './toast.component';

const DELAY_ON_CLICK = 400;

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let service: NgxToastService;
  let load: ReturnType<typeof vi.fn>;

  const toast: NgxToast = {
    type: NgxToastType.success,
    title: 'Success',
    messages: ['Saved'],
  };

  // Deliberately not fixture.whenStable(): the component holds pending auto-destroy timers,
  // so waiting for the zone to drain would either hang under fake timers or dismiss the toast.
  async function flush(): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function hostStyle(property: string): string {
    return (fixture.componentRef.location.nativeElement as HTMLElement).style.getPropertyValue(property);
  }

  async function create(inputs: Record<string, unknown> = {}): Promise<void> {
    fixture = TestBed.createComponent(ToastComponent);
    fixture.componentRef.setInput('toast', toast);

    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }

    await flush();
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    load = vi.fn().mockResolvedValue(null);

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [{ provide: NgxToastIconRegistry, useValue: { load } }],
    }).compileComponents();

    service = TestBed.inject(NgxToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', async () => {
    await create();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the title and a single message', async () => {
    await create();

    expect(element().querySelector('.ngx-toast__title')?.textContent).toContain('Success');
    expect(element().querySelector('.ngx-toast__message')?.textContent).toContain('Saved');
    expect(element().querySelector('.ngx-toast__message ul')).toBeNull();
  });

  it('renders multiple messages as a list', async () => {
    fixture = TestBed.createComponent(ToastComponent);
    fixture.componentRef.setInput('toast', { ...toast, messages: ['one', 'two'] });
    await flush();

    expect(element().querySelectorAll('.ngx-toast__message li')).toHaveLength(2);
  });

  it('renders the stack CTA and emits showStacked when clicked', async () => {
    await create({ isStackToast: true });
    const emitted = vi.fn();
    fixture.componentInstance.showStacked.subscribe(emitted);

    const cta = element().querySelector<HTMLElement>('.ngx-toast__stack-cta');
    expect(cta?.textContent).toContain('Saved');

    cta!.click();
    expect(emitted).toHaveBeenCalledTimes(1);
  });

  describe('icons', () => {
    it('uses the built-in sprite when the toast has no icon', async () => {
      await create();

      expect(element().querySelector('.ngx-toast__icon use')?.getAttribute('xlink:href')).toBe('#success');
      expect(load).not.toHaveBeenCalled();
    });

    it('inlines a resolved custom icon', async () => {
      // Must be a SafeHtml: Angular's own sanitizer has no SVG elements in its allowlist and
      // would strip a raw string entirely, which is why the registry trusts sanitized markup.
      const sanitizer = TestBed.inject(DomSanitizer);
      load.mockResolvedValue(sanitizer.bypassSecurityTrustHtml('<svg id="custom"></svg>'));
      fixture = TestBed.createComponent(ToastComponent);
      fixture.componentRef.setInput('toast', { ...toast, icon: 'assets/bell.svg' });
      await flush();
      await flush();

      expect(load).toHaveBeenCalledWith('assets/bell.svg', expect.anything());
      expect(element().querySelector('#custom')).not.toBeNull();
    });

    it('falls back to the sprite when the icon fails to load', async () => {
      load.mockResolvedValue(null);
      fixture = TestBed.createComponent(ToastComponent);
      fixture.componentRef.setInput('toast', { ...toast, icon: 'assets/broken.svg' });
      await flush();
      await flush();

      expect(element().querySelector('.ngx-toast__icon use')?.getAttribute('xlink:href')).toBe('#success');
    });
  });

  describe('theming', () => {
    it('derives the colour from the service when no colour input is given', async () => {
      await create();

      expect(hostStyle('--ngx-toast-color')).toBe(service.typeColor()[NgxToastType.success]);
      expect(hostStyle('--ngx-toast-delay')).toBe('3000ms');
    });

    it('prefers an explicit colour input', async () => {
      await create({ color: '#01B78B' });

      expect(hostStyle('--ngx-toast-color')).toBe('#01B78B');
    });

    // Regression: initTheme() ran once in ngOnInit, so later input changes never reached the DOM.
    it('updates the host style when the colour input changes after init', async () => {
      await create({ color: '#01B78B' });

      fixture.componentRef.setInput('color', '#FF0000');
      await flush();

      expect(hostStyle('--ngx-toast-color')).toBe('#FF0000');
    });

    it('omits the delay variable and the progress bar when the delay is Infinity', async () => {
      await create({ delay: Infinity });

      expect(hostStyle('--ngx-toast-delay')).toBe('');
      expect(element().querySelector('.ngx-toast--progress-bar')).toBeNull();
    });

    it('drops the progress bar when displayProgressBar is false', async () => {
      await create({ displayProgressBar: false });

      expect(element().querySelector('.ngx-toast--progress-bar')).toBeNull();
    });
  });

  describe('lifecycle', () => {
    it('opens one tick after view init', async () => {
      await create();
      expect(element().querySelector('.ngx-toast--opened')).toBeNull();

      vi.advanceTimersByTime(1);
      await flush();

      expect(element().querySelector('.ngx-toast--opened')).not.toBeNull();
    });

    it('emits closed 400ms after close()', async () => {
      await create();
      const emitted = vi.fn();
      fixture.componentInstance.closed.subscribe(emitted);

      fixture.componentInstance.close();
      vi.advanceTimersByTime(DELAY_ON_CLICK - 1);
      expect(emitted).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(emitted).toHaveBeenCalledWith(toast);
    });

    it('auto-destroys at delay + 400ms', async () => {
      await create({ delay: 1000 });
      const emitted = vi.fn();
      fixture.componentInstance.destroyed.subscribe(emitted);

      vi.advanceTimersByTime(1000 + DELAY_ON_CLICK - 1);
      expect(emitted).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(emitted).toHaveBeenCalledWith(toast);
    });

    it('never auto-destroys when the delay is Infinity', async () => {
      await create({ delay: Infinity });
      const emitted = vi.fn();
      fixture.componentInstance.destroyed.subscribe(emitted);

      vi.advanceTimersByTime(1_000_000);

      expect(emitted).not.toHaveBeenCalled();
    });

    it('pauses the countdown while hovered and resumes on leave', async () => {
      await create({ delay: 1000 });
      const emitted = vi.fn();
      fixture.componentInstance.destroyed.subscribe(emitted);

      vi.advanceTimersByTime(400);
      fixture.componentInstance.mouseEnter();

      vi.advanceTimersByTime(10_000);
      expect(emitted).not.toHaveBeenCalled();

      fixture.componentInstance.mouseLeave();
      vi.advanceTimersByTime(600 + DELAY_ON_CLICK);

      expect(emitted).toHaveBeenCalledTimes(1);
    });

    it('does not emit after the component is destroyed', async () => {
      await create({ delay: 1000 });
      const emitted = vi.fn();
      fixture.componentInstance.destroyed.subscribe(emitted);

      fixture.destroy();
      vi.advanceTimersByTime(10_000);

      expect(emitted).not.toHaveBeenCalled();
    });
  });

  it('emits clicked and invokes the toast click callback', async () => {
    const click = vi.fn();
    fixture = TestBed.createComponent(ToastComponent);
    fixture.componentRef.setInput('toast', { ...toast, click });
    await flush();

    const emitted = vi.fn();
    fixture.componentInstance.clicked.subscribe(emitted);

    element().querySelector<HTMLElement>('.ngx-toast__content')!.click();

    expect(emitted).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });
});

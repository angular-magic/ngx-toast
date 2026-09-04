import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxToastPosition } from '../base/toast-position.enum';
import { NgxToastService } from '../toast.service';
import { ToastCenterComponent } from './toast-center.component';

describe('ToastCenterComponent', () => {
  let fixture: ComponentFixture<ToastCenterComponent>;
  let service: NgxToastService;

  // Deliberately not fixture.whenStable(): rendered toasts hold pending auto-destroy timers,
  // and waiting for the zone to drain would let every toast dismiss itself first.
  async function flush(): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  }

  function wrapper(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.ngx-toast__wrapper')!;
  }

  function toasts(): NodeListOf<HTMLElement> {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('ngx-toast');
  }

  function stackCta(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.ngx-toast__stack-cta');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastCenterComponent],
    }).compileComponents();

    service = TestBed.inject(NgxToastService);
    fixture = TestBed.createComponent(ToastCenterComponent);
    await flush();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders nothing until a toast is raised', () => {
    expect(toasts()).toHaveLength(0);
  });

  it('renders one ngx-toast per toast', async () => {
    service.success({ messages: ['a'] });
    service.error({ messages: ['b'] });
    await flush();

    expect(toasts()).toHaveLength(2);
  });

  it('collapses to the stacked CTA once the list exceeds maxUnstackedToast', async () => {
    service.maxUnstackedToast.set(2);
    for (const message of ['a', 'b', 'c']) {
      service.success({ messages: [message] });
    }
    await flush();

    expect(toasts()).toHaveLength(1);
    expect(stackCta()?.textContent).toContain(service.stackNotificationCTA());
  });

  // At exactly maxUnstackedToast both isAvailable() and isStacked() are true, and the `||`
  // shows every toast. Collapsing the two conditions into one would change this.
  it('still shows every toast at exactly maxUnstackedToast', async () => {
    service.maxUnstackedToast.set(2);
    service.success({ messages: ['a'] });
    service.success({ messages: ['b'] });
    await flush();

    expect(toasts()).toHaveLength(2);
    expect(stackCta()).toBeNull();
  });

  it('expands the full list when the CTA is clicked, and re-stacks after the list empties', async () => {
    service.maxUnstackedToast.set(2);
    for (const message of ['a', 'b', 'c']) {
      service.success({ messages: [message] });
    }
    await flush();

    stackCta()!.click();
    await flush();
    expect(toasts()).toHaveLength(3);

    service.clear();
    await flush();
    for (const message of ['d', 'e', 'f']) {
      service.success({ messages: [message] });
    }
    await flush();

    expect(stackCta()).not.toBeNull();
  });

  // Regression guard for the Angular 22 OnPush default. The template used to read
  // ngxToastService.position through NgStyle, so a setPosition() call with no new toast
  // emission never marked this view dirty and the container stayed put.
  it('moves the container when setPosition is called after toasts are rendered', async () => {
    service.success({ messages: ['a'] });
    await flush();
    expect(wrapper().style.top).toBe('20px');
    expect(wrapper().style.right).toBe('20px');

    service.setPosition(NgxToastPosition.BOTTOM_LEFT);
    await flush();

    expect(wrapper().style.bottom).toBe('20px');
    expect(wrapper().style.left).toBe('20px');
    expect(wrapper().style.top).toBe('');
  });

  // Regression guard for the same default. `toastAvailable` was a pure pipe reading mutable
  // service state, so shrinking maxUnstackedToast without a new emission changed nothing.
  it('collapses when maxUnstackedToast shrinks under an existing list', async () => {
    service.success({ messages: ['a'] });
    service.success({ messages: ['b'] });
    await flush();
    expect(toasts()).toHaveLength(2);

    service.maxUnstackedToast.set(1);
    await flush();

    expect(toasts()).toHaveLength(1);
    expect(stackCta()).not.toBeNull();
  });

  // The stacked toast used to be a field initialiser, capturing the title and CTA once.
  it('tracks CTA and title changes made after construction', async () => {
    service.maxUnstackedToast.set(1);
    service.stackNotificationCTA.set('See everything');
    service.success({ messages: ['a'] });
    service.success({ messages: ['b'] });
    await flush();

    expect(stackCta()?.textContent).toContain('See everything');
  });

  it('removes a toast when it reports itself closed', async () => {
    service.success({ messages: ['a'] });
    await flush();

    fixture.componentInstance.remove(service.toasts()[0]);
    await flush();

    expect(toasts()).toHaveLength(0);
  });
});

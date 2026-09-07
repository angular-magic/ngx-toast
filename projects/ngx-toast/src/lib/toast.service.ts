import { Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';

import { NgxToast } from './base/toast.model';
import { NgxToastPosition } from './base/toast-position.enum';
import { NgxToastType } from './base/toast-type.enum';

/** Inline style record applied to the toast center wrapper, per position. */
const POSITIONS: Record<NgxToastPosition, Record<string, string>> = {
  [NgxToastPosition.TOP_RIGHT]: { top: '20px', right: '20px' },
  [NgxToastPosition.TOP_CENTER]: { top: '20px', right: '50%', transform: 'translateX(50%)' },
  [NgxToastPosition.TOP_LEFT]: { top: '20px', left: '20px' },
  [NgxToastPosition.BOTTOM_RIGHT]: { bottom: '20px', right: '20px' },
  [NgxToastPosition.BOTTOM_CENTER]: { bottom: '20px', right: '50%', transform: 'translateX(50%)' },
  [NgxToastPosition.BOTTOM_LEFT]: { bottom: '20px', left: '20px' },
};

/** Types that have a dedicated shorthand method on the service. */
type ShorthandToastType = Exclude<NgxToastType, NgxToastType.none>;

@Injectable({
  providedIn: 'root',
})
export class NgxToastService {
  readonly typeColor = signal<Record<NgxToastType, string>>({
    [NgxToastType.none]: '#0067FF',
    [NgxToastType.info]: '#0067FF',
    [NgxToastType.warning]: '#EF8D32',
    [NgxToastType.error]: '#FE355A',
    [NgxToastType.success]: '#00CC69',
  });

  /** Paths to custom SVG icons, keyed by type. Empty until {@link setCustomIcons} is called. */
  readonly typeIcons = signal<Partial<Record<NgxToastType, string>>>({});

  readonly typeDelays = signal<Record<NgxToastType, number>>({
    [NgxToastType.none]: 5000,
    [NgxToastType.info]: 3000,
    [NgxToastType.warning]: 3000,
    [NgxToastType.error]: 3000,
    [NgxToastType.success]: 3000,
  });

  readonly typeTitles = signal<Record<NgxToastType, string>>({
    [NgxToastType.none]: 'Notification',
    [NgxToastType.info]: 'Info',
    [NgxToastType.warning]: 'Warning',
    [NgxToastType.error]: 'Failure',
    [NgxToastType.success]: 'Success',
  });

  readonly displayProgressBar = signal(true);
  readonly maxUnstackedToast = signal(3);
  readonly stackNotificationCTA = signal('Click here to see all notifications!');
  readonly position = signal<Record<string, string>>(POSITIONS[NgxToastPosition.TOP_RIGHT]);

  private readonly items = new BehaviorSubject<NgxToast[]>([]);
  private readonly items$: Observable<NgxToast[]> = this.items.asObservable();

  /** Signal view of the same state backing {@link getToasts}. */
  readonly toasts = toSignal(this.items$, { requireSync: true });

  /**
   * In case if you want to set custom icons, you should provide absolute path to your SVG file
   * Example: this.ngxToastService.setCustomIcons({[NgxToastType.success]: 'assets/check.svg'});
   * @param icons
   */
  setCustomIcons(icons: Partial<Record<NgxToastType, string>>): void {
    this.typeIcons.update(current => ({ ...current, ...icons }));
  }

  /**
   * In case if you want to set custom colors, you should provide hex color
   * Example: this.ngxToastService.setCustomColors({[NgxToastType.success]: '#00CC69'});
   * @param colors
   */
  setCustomColors(colors: Partial<Record<NgxToastType, string>>): void {
    this.typeColor.update(current => ({ ...current, ...colors }));
  }

  /**
   * In case if you want to set custom delays, you should provide milliseconds value
   * Example: this.ngxToastService.setCustomDelays({[NgxToastType.success]: 5000});
   * @param delays
   */
  setCustomDelays(delays: Partial<Record<NgxToastType, number>>): void {
    this.typeDelays.update(current => ({ ...current, ...delays }));
  }

  /**
   * In case if you want to set custom titles, you should provide the title text
   * Example: this.ngxToastService.setCustomTitle({[NgxToastType.success]: 'Done'});
   * @param titles
   */
  setCustomTitle(titles: Partial<Record<NgxToastType, string>>): void {
    this.typeTitles.update(current => ({ ...current, ...titles }));
  }

  /**
   * In case if you want to set another position, you should provide position value
   * Example: this.ngxToastService.setPosition(NgxToastPosition.TOP_LEFT);
   * @param position
   */
  setPosition(position: NgxToastPosition): void {
    this.position.set(POSITIONS[position] ?? POSITIONS[NgxToastPosition.TOP_RIGHT]);
  }

  open(toast: NgxToast): void {
    this.items.next([...this.items.value, { id: nextId(), ...toast }]);
  }

  close(toast: NgxToast): void {
    this.items.next(this.items.value.filter(item => item?.id !== toast?.id));
  }

  clear(): void {
    this.items.next([]);
  }

  getToasts(): Observable<NgxToast[]> {
    return this.items$;
  }

  success(toast: Omit<NgxToast, 'type'>): void {
    this.push(NgxToastType.success, toast);
  }

  error(toast: Omit<NgxToast, 'type'>): void {
    this.push(NgxToastType.error, toast);
  }

  warning(toast: Omit<NgxToast, 'type'>): void {
    this.push(NgxToastType.warning, toast);
  }

  info(toast: Omit<NgxToast, 'type'>): void {
    this.push(NgxToastType.info, toast);
  }

  private push(type: ShorthandToastType, toast: Omit<NgxToast, 'type'>): void {
    // The caller's own title and icon win; the type defaults only fill the gaps.
    const icon = toast.icon ?? this.typeIcons()[type];
    const item: NgxToast = {
      id: nextId(),
      title: this.typeTitles()[type],
      ...toast,
      type,
      ...(icon === undefined ? {} : { icon }),
    };

    this.items.next([...this.items.value, item]);
  }
}

function nextId(): number {
  return new Date().getTime() + Math.random();
}

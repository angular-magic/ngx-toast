import { Injectable } from '@angular/core';
import { NgxToast } from "./base/toast.model";
import { NgxToastType } from "./base/toast-type.enum";
import { BehaviorSubject, Observable } from "rxjs";
import { NgxToastPosition } from "./base/toast-position.enum";

@Injectable({
  providedIn: 'root'
})
export class NgxToastService {
  typeColor: Record<NgxToastType, string> = {
    [NgxToastType.info]: '#0067FF',
    [NgxToastType.warning]: '#EF8D32',
    [NgxToastType.error]: '#FE355A',
    [NgxToastType.success]: '#00CC69'
  };
  typeIcons: Record<NgxToastType, string> = {
    [NgxToastType.info]: null,
    [NgxToastType.warning]: null,
    [NgxToastType.error]: null,
    [NgxToastType.success]: null,
  };

  typeDelays: Record<NgxToastType, number> = {
    [NgxToastType.info]: 3000,
    [NgxToastType.warning]: 3000,
    [NgxToastType.error]: 3000,
    [NgxToastType.success]: 3000,
  };

  typeTitles: Record<NgxToastType, string> = {
    [NgxToastType.info]: 'Info',
    [NgxToastType.warning]: 'Warning',
    [NgxToastType.error]: 'Failure',
    [NgxToastType.success]: 'Success',
  };
  displayProgressBar: boolean = true;
  position: Record<string, string>;

  private toasts: BehaviorSubject<NgxToast[]> = new BehaviorSubject<NgxToast[]>([]);
  private toasts$: Observable<NgxToast[]> = this.toasts.asObservable();

  constructor() {
    this.position = this.getPositions(NgxToastPosition.TOP_RIGHT);
  }

  /**
   * In case if you want to set custom icons, you should provide absolute path to your SVG file
   * Example: this.ngxToastService.setCustomIcons({[NgxToastType.success]: 'assets/check.svg'});
   * @param icons
   */
  setCustomIcons(icons: Partial<Record<NgxToastType, string>>): void {
    this.typeIcons = { ...this.typeIcons, ...icons };
  }

  /**
   * In case if you want to set custom icons, you should provide hex color
   * Example: this.ngxToastService.setCustomColors({[NgxToastType.success]: '#00CC69'});
   * @param colors
   */
  setCustomColors(colors: Partial<Record<NgxToastType, string>>): void {
    this.typeColor = { ...this.typeColor, ...colors };
  }

  /**
   * In case if you want to set custom delays, you should provide milliseconds value
   * Example: this.ngxToastService.setCustomDelays({[NgxToastType.success]: 5000});
   * @param delays
   */
  setCustomDelays(delays: Partial<Record<NgxToastType, number>>): void {
    this.typeDelays = { ...this.typeDelays, ...delays };
  }

  /**
   * In case if you want to set custom delays, you should provide milliseconds value
   * Example: this.ngxToastService.setCustomDelays({[NgxToastType.success]: 5000});
   * @param titles
   */
  setCustomTitle(titles: Partial<Record<NgxToastType, string>>): void {
    this.typeTitles = { ...this.typeTitles, ...titles };
  }

  /**
   * In case if you want to set another position, you should provide position value
   * Example: this.ngxToastService.setPosition(NgxToastPosition.TOP_LEFT);
   * @param position
   */
  setPosition(position: NgxToastPosition): void {
    this.position = this.getPositions(position);
  }

  open(toast: NgxToast): void {
    const items = [
      ...this.toasts.value,
      { id: new Date().getTime() + Math.random(), ...toast }
    ];

    this.toasts.next(items);
  }

  close(toast: NgxToast): void {
    const items = this.toasts.value.filter(item => item?.id !== toast?.id);

    this.toasts.next(items);
  }

  getToasts(): Observable<NgxToast[]> {
    return this.toasts$;
  }

  success(toast: Omit<NgxToast, 'type'>): void {
    const item: NgxToast = {
      id: new Date().getTime() + Math.random(),
      title: this.typeTitles[NgxToastType.success],
      ...toast,
      type: NgxToastType.success,
      icon: this.typeIcons[NgxToastType.success]
    };
    const items = [...this.toasts.value, item];

    this.toasts.next(items);
  }

  error(toast: Omit<NgxToast, 'type'>): void {
    const item: NgxToast = {
      id: new Date().getTime() + Math.random(),
      title: this.typeTitles[NgxToastType.error],
      ...toast,
      type: NgxToastType.error,
      icon: this.typeIcons[NgxToastType.error]
    };
    const items = [...this.toasts.value, item];

    this.toasts.next(items);

  }

  warning(toast: Omit<NgxToast, 'type'>): void {
    const item: NgxToast = {
      id: new Date().getTime() + Math.random(),
      title: this.typeTitles[NgxToastType.warning],
      ...toast,
      type: NgxToastType.warning,
      icon: this.typeIcons[NgxToastType.warning]
    };
    const items = [...this.toasts.value, item];

    this.toasts.next(items);
  }

  info(toast: Omit<NgxToast, 'type'>): void {
    const item: NgxToast = {
      id: new Date().getTime() + Math.random(),
      title: this.typeTitles[NgxToastType.info],
      ...toast,
      type: NgxToastType.info,
      icon: this.typeIcons[NgxToastType.info]
    };
    const items = [...this.toasts.value, item];

    this.toasts.next(items);
  }

  private getPositions(position: NgxToastPosition): Record<string, string> {
    switch (position) {
      case NgxToastPosition.TOP_RIGHT:
        return {
          top: '10px',
          right: '10px'
        };
      case NgxToastPosition.TOP_CENTER:
        return {
          top: '10px',
          right: '50%',
          transform: `translateX(50%)`
        };
      case NgxToastPosition.TOP_LEFT:
        return {
          top: '10px',
          left: '10px'
        };
      case NgxToastPosition.BOTTOM_RIGHT:
        return {
          bottom: '10px',
          right: '10px'
        };
      case NgxToastPosition.BOTTOM_CENTER:
        return {
          bottom: '10px',
          right: '50%',
          transform: `translateX(50%)`
        };
      case NgxToastPosition.BOTTOM_LEFT:
        return {
          bottom: '10px',
          left: '10px'
        };
      default:
        return {
          top: '10px',
          right: '10px'
        };
    }
  }
}

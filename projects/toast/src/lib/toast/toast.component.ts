import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { NgxToast } from "../base/toast.model";
import { NgxToastType } from "../base/toast-type.enum";
import { NgxToastService } from "../toast.service";

@Component({
  selector: 'ngx-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, AfterViewInit {
  @Input() toast: NgxToast;
  @Input() color: string;
  @Input() delay = 3000;
  @Input() displayProgressBar: boolean = true;
  @Output() clicked: EventEmitter<NgxToast> = new EventEmitter<NgxToast>();
  @Output() destroyed: EventEmitter<NgxToast> = new EventEmitter<NgxToast>();
  @Output() closed: EventEmitter<NgxToast> = new EventEmitter<NgxToast>();
  isOpened: boolean;
  isInfinity: boolean;
  NgxToastType: typeof NgxToastType = NgxToastType;

  private static DELAY_ON_CLICK: number = 400;

  private closeTimeout;
  private destroyTimeout;
  private referencePointTimestamp;
  private mouseEnterTimestamp;

  constructor(
    public readonly ngxToastService: NgxToastService,
    private readonly element: ElementRef,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.init();
    this.isInfinity = this.delay === Infinity;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isOpened = true;
      this.cd.markForCheck();
    });
  }

  mouseEnter(): void {
    this.mouseEnterTimestamp = performance.now();

    clearTimeout(this.closeTimeout);
    clearTimeout(this.destroyTimeout);
  }

  mouseLeave(): void {
    const timestampGap = this.mouseEnterTimestamp - this.referencePointTimestamp;

    this.autoSelfDestroy(this.delay - timestampGap);
    this.referencePointTimestamp = performance.now() - timestampGap;
  }

  toastClick(): void {
    if (this.toast.click) {
      this.toast.click(this.toast);
    }
  }

  toastDestroy(): void {
    if (this.toast.destroy) {
      this.toast.destroy(this.toast);
    }
  }

  toastClose(): void {
    if (this.toast.close) {
      this.toast.close(this.toast);
    }
  }

  close(): void {
    this.isOpened = false;

    setTimeout(() => {
      this.toastClose();
      this.closed.emit(this.toast);
    }, ToastComponent.DELAY_ON_CLICK);
  }

  private init(): void {
    this.referencePointTimestamp = performance.now();
    this.initTheme();
    this.autoSelfDestroy(this.delay);
  }

  private initTheme(): void {
    this.element.nativeElement.style.setProperty('--ngx-toast-delay', `${this.delay}ms`);
    this.element.nativeElement.style.setProperty('--ngx-toast-color', this.color || this.ngxToastService.typeColor[this.toast.type]);
  }

  private autoSelfDestroy(delay: number): void {
    if (this.delay !== Infinity) {
      this.closeTimeout = setTimeout(() => {
        this.isOpened = false;
        this.cd.markForCheck();
      }, delay);

      this.destroyTimeout = setTimeout(() => {
        this.destroyed.emit(this.toast);
        this.toastDestroy();
      }, delay + ToastComponent.DELAY_ON_CLICK);
    }
  }
}

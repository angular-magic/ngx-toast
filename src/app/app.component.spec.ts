import { TestBed } from '@angular/core/testing';
import { NgxToastPosition, NgxToastType } from '@angular-magic/ngx-toast';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    expect(TestBed.createComponent(AppComponent).componentInstance).toBeTruthy();
  });

  it(`should have as title 'ngx-toast'`, () => {
    expect(TestBed.createComponent(AppComponent).componentInstance.title).toBe('ngx-toast');
  });

  it('renders the toast center', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('ngx-toast-center')).not.toBeNull();
  });

  it('seeds the form with the documented defaults', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      title: 'Notification',
      message: 'My message will be here',
      type: NgxToastType.success,
      position: NgxToastPosition.TOP_RIGHT,
      timeout: 3000,
      color: '',
      multipleMessages: false,
      customIcon: false,
      enableOnClick: false,
      enableOnDestroy: false,
      enableOnClosed: false,
      showProgress: true,
      enableStack: false,
    });
  });

  it('offers every position from the enum', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance.positions).toEqual(Object.values(NgxToastPosition));
  });
});

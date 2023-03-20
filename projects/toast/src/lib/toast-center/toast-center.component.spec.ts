import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastCenterComponent } from './toast-center.component';

describe('ToastCenterComponent', () => {
  let component: ToastCenterComponent;
  let fixture: ComponentFixture<ToastCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToastCenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

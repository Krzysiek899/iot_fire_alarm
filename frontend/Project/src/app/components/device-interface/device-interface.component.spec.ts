import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceInterfaceComponent } from './device-interface.component';

describe('DeviceInterfaceComponent', () => {
  let component: DeviceInterfaceComponent;
  let fixture: ComponentFixture<DeviceInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

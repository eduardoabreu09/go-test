import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { FirmwareComponent } from './firmware';
import { FirmwareService } from '../services/firmware';
import { Firmware } from '../model/firmware';

describe('Firmware', () => {
  let component: FirmwareComponent;
  let fixture: ComponentFixture<FirmwareComponent>;
  let firmwaresResponse$: Subject<Firmware[]>;

  beforeEach(async () => {
    firmwaresResponse$ = new Subject<Firmware[]>();

    await TestBed.configureTestingModule({
      imports: [FirmwareComponent],
      providers: [
        {
          provide: FirmwareService,
          useValue: {
            getAllFirmwares: () => firmwaresResponse$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FirmwareComponent);
    component = fixture.componentInstance;
  });

  it('should show loading while firmwares are being fetched', () => {
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmwareForm } from './firmware-form';
import { API_BASE_URL } from '../../core/api.config';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('FirmwareForm', () => {
  let component: FirmwareForm;
  let fixture: ComponentFixture<FirmwareForm>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmwareForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FirmwareForm);
    httpController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the firmware form and reset on success', () => {
    fixture.detectChanges();

    component.firmwareForm.setValue({
      version: '1.0.0',
      url: 'test.example.com',
    });

    component.submitFirmwareForm();

    const request = httpController.expectOne(`${API_BASE_URL}/firmwares`);
    expect(request.request.method).toBe('POST');
    request.flush({
      version: '1.0.0',
      url: 'test.example.com',
      created_at: '2026-01-03T00:00:00Z',
    });

    expect(component.firmwareRequest().status).toBe('success');
    expect(component.firmwareForm.getRawValue()).toEqual({
      version: '',
      url: '',
    });
  });
});

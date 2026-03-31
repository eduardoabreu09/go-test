import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { CreatePage } from './create';

describe('CreatePage', () => {
  let component: CreatePage;
  let fixture: ComponentFixture<CreatePage>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CreatePage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should load farm and firmware options on init', () => {
    fixture.detectChanges();

    httpController.expectOne(`${API_BASE_URL}/farms`).flush([
      {
        id: 1,
        firmware_version: '1.0.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);

    httpController.expectOne(`${API_BASE_URL}/firmwares`).flush([
      {
        version: '1.0.0',
        url: 'https://cdn.example.com/1.0.0.bin',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        version: '1.0.1',
        url: 'https://cdn.example.com/1.0.1.bin',
        created_at: '2026-01-02T00:00:00Z',
      },
    ]);

    expect(component.farms().length).toBe(1);
    expect(component.firmwares().length).toBe(2);
  });

  it('should submit the user form and reset on success', () => {
    fixture.detectChanges();
    httpController.expectOne(`${API_BASE_URL}/farms`).flush([]);
    httpController.expectOne(`${API_BASE_URL}/firmwares`).flush([]);

    component.userForm.setValue({
      name: 'Morgan Lee',
      email: 'morgan@example.com',
    });

    component.submitUserForm();

    const request = httpController.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.method).toBe('POST');
    request.flush({
      id: 7,
      name: 'Morgan Lee',
      email: 'morgan@example.com',
      created_at: '2026-01-03T00:00:00Z',
    });

    expect(component.userRequest().status).toBe('success');
    expect(component.userForm.getRawValue()).toEqual({
      name: '',
      email: '',
    });
  });

  it('should filter the update target firmware list by selected farm', () => {
    fixture.detectChanges();

    httpController.expectOne(`${API_BASE_URL}/farms`).flush([
      {
        id: 1,
        firmware_version: '1.0.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);

    httpController.expectOne(`${API_BASE_URL}/firmwares`).flush([
      {
        version: '1.0.0',
        url: 'https://cdn.example.com/1.0.0.bin',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        version: '1.1.0',
        url: 'https://cdn.example.com/1.1.0.bin',
        created_at: '2026-01-02T00:00:00Z',
      },
    ]);

    component.updateForm.controls.farmId.setValue(1);

    expect(component.availableTargetFirmwares().map((firmware) => firmware.version)).toEqual([
      '1.1.0',
    ]);
  });
});

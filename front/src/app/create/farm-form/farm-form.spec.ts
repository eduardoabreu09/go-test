import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmForm } from './farm-form';
import { API_BASE_URL } from '../../core/api.config';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('FarmForm', () => {
  let component: FarmForm;
  let fixture: ComponentFixture<FarmForm>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmForm);
    httpController = TestBed.inject(HttpTestingController);

    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request firmwares when the component is created', () => {
    fixture.detectChanges();

    const request = httpController.expectOne(`${API_BASE_URL}/firmwares`);
    expect(request.request.method).toBe('GET');

    request.flush([
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

    expect(component.firmwares().length).toBe(2);
  });

  it('should mark the form as touched and block submit when the form is invalid', () => {
    fixture.detectChanges();

    httpController.expectOne(`${API_BASE_URL}/firmwares`).flush([
      {
        version: '1.0.0',
        url: 'https://cdn.example.com/1.0.0.bin',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]);

    component.submitFarmForm();
    fixture.detectChanges();

    expect(component.farmForm.invalid).toBe(true);
    expect(component.farmForm.controls.version.touched).toBe(true);
    expect(component.farmRequest().status).toBe('idle');
    httpController.expectNone(`${API_BASE_URL}/farms`);

    const errorMessage: HTMLElement | null = fixture.nativeElement.querySelector('.field__error');
    expect(errorMessage?.textContent).toContain('Select a firmware version.');
  });
});

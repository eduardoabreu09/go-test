import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../core/api.config';
import { DashboardPage } from './dashboard';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should load users, firmwares, farms, and pending updates on init', () => {
    fixture.detectChanges();

    httpController.expectOne(`${API_BASE_URL}/users`).flush([
      { id: 1, name: 'Eduardo', email: 'eduardo@example.com', created_at: '2026-01-01T00:00:00Z' },
    ]);
    httpController.expectOne(`${API_BASE_URL}/firmwares`).flush([
      { version: '1.0.0', url: 'https://cdn.example.com/1.0.0.bin', created_at: '2026-01-01T00:00:00Z' },
    ]);
    httpController.expectOne(`${API_BASE_URL}/farms`).flush([
      {
        id: 1,
        firmware_version: '1.0.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);
    httpController.expectOne(`${API_BASE_URL}/updates?status=PENDING`).flush([
      {
        id: 4,
        status: { download_status: 'PENDING', valid: true },
        firmware_version: '1.0.1',
        farm_id: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);

    expect(component.usersState().data).toHaveLength(1);
    expect(component.firmwaresState().data).toHaveLength(1);
    expect(component.farmsState().data).toHaveLength(1);
    expect(component.updatesState().data).toHaveLength(1);
    expect(component.selectedUpdateStatus()).toBe('PENDING');
  });

  it('should reload updates when the status filter changes', () => {
    fixture.detectChanges();

    httpController.expectOne(`${API_BASE_URL}/users`).flush([]);
    httpController.expectOne(`${API_BASE_URL}/firmwares`).flush([]);
    httpController.expectOne(`${API_BASE_URL}/farms`).flush([]);
    httpController.expectOne(`${API_BASE_URL}/updates?status=PENDING`).flush([]);

    component.onUpdateStatusChange('COMPLETED');

    const request = httpController.expectOne(`${API_BASE_URL}/updates?status=COMPLETED`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 7,
        status: { download_status: 'COMPLETED', valid: true },
        firmware_version: '1.0.2',
        farm_id: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:10Z',
      },
    ]);

    expect(component.selectedUpdateStatus()).toBe('COMPLETED');
    expect(component.updatesState().data?.[0].status.download_status).toBe('COMPLETED');
  });
});

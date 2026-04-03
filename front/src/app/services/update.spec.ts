import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { successState } from '../model/request-state';
import { FarmUpdate } from '../model/update';
import { UpdateService } from './update';

describe('UpdateService', () => {
  let service: UpdateService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UpdateService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should load updates into updatesState', () => {
    const previousUpdates: FarmUpdate[] = [
      {
        id: 10,
        status: { download_status: 'PENDING', valid: true },
        firmware_version: '1.0.1',
        farm_id: 2,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];
    const response: FarmUpdate[] = [
      {
        id: 41,
        status: { download_status: 'COMPLETED', valid: true },
        firmware_version: '1.0.2',
        farm_id: 7,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:10Z',
      },
    ];

    service.updatesState.set(successState(previousUpdates, HttpStatusCode.Ok));

    service.loadUpdates('COMPLETED');

    expect(service.updatesState().status).toBe('loading');
    expect(service.updatesState().data).toEqual(previousUpdates);

    const request = httpController.expectOne(`${API_BASE_URL}/updates?status=COMPLETED`);
    expect(request.request.method).toBe('GET');
    request.flush(response);

    expect(service.updatesState().status).toBe('success');
    expect(service.updatesState().data).toEqual(response);
    expect(service.updatesState().httpStatus).toBe(HttpStatusCode.Ok);
  });

  it('should keep previous updates when loadUpdates fails', () => {
    const previousUpdates: FarmUpdate[] = [
      {
        id: 10,
        status: { download_status: 'PENDING', valid: true },
        firmware_version: '1.0.1',
        farm_id: 2,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    service.updatesState.set(successState(previousUpdates, HttpStatusCode.Ok));

    service.loadUpdates('ERROR');

    const request = httpController.expectOne(`${API_BASE_URL}/updates?status=ERROR`);
    request.flush(
      { message: 'Could not load updates.' },
      {
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      },
    );

    expect(service.updatesState().status).toBe('error');
    expect(service.updatesState().data).toEqual(previousUpdates);
    expect(service.updatesState().httpStatus).toBe(HttpStatusCode.InternalServerError);
    expect(service.updatesState().errorMessage).toBe('Could not load updates.');
  });

  it('should list updates by status', () => {
    service.listByStatus('PENDING').subscribe((updates) => {
      expect(updates).toHaveLength(1);
      expect(updates[0].status.download_status).toBe('PENDING');
    });

    const request = httpController.expectOne(`${API_BASE_URL}/updates?status=PENDING`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 41,
        status: { download_status: 'PENDING', valid: true },
        firmware_version: '1.0.2',
        farm_id: 7,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);
  });

  it('should check farm updates', () => {
    service.checkUpdate(7).subscribe((update) => {
      expect(update.id).toBe(41);
      expect(update.farm_id).toBe(7);
    });

    const request = httpController.expectOne(`${API_BASE_URL}/updates/7/check`);
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 41,
      status: { download_status: 'PENDING', valid: true },
      firmware_version: '1.0.2',
      farm_id: 7,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  });

  it('should complete an update', () => {
    service.completeUpdate(41).subscribe((update) => {
      expect(update.status.download_status).toBe('COMPLETED');
    });

    const request = httpController.expectOne(`${API_BASE_URL}/updates/41/complete`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({});
    request.flush({
      id: 41,
      status: { download_status: 'COMPLETED', valid: true },
      firmware_version: '1.0.2',
      farm_id: 7,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:10Z',
    });
  });
});

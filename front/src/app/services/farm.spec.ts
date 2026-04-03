import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { successState } from '../model/request-state';

import { FarmService } from './farm';

describe('FarmService', () => {
  let service: FarmService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FarmService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list farms', () => {
    const response = [
      {
        id: 1,
        firmware_version: '1.0.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    service.getAllFarms().subscribe((farms) => {
      expect(farms).toEqual(response);
    });

    const request = httpController.expectOne(`${API_BASE_URL}/farms`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should load farms into farmsState', () => {
    const previousFarms = [
      {
        id: 9,
        firmware_version: '0.9.0',
        created_at: '2025-12-31T00:00:00Z',
        updated_at: '2025-12-31T00:00:00Z',
      },
    ];
    const response = [
      {
        id: 1,
        firmware_version: '1.0.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    service.farmsState.set(successState(previousFarms, HttpStatusCode.Ok));

    service.loadFarms();

    expect(service.farmsState().status).toBe('loading');
    expect(service.farmsState().data).toEqual(previousFarms);

    const request = httpController.expectOne(`${API_BASE_URL}/farms`);
    expect(request.request.method).toBe('GET');
    request.flush(response);

    expect(service.farmsState().status).toBe('success');
    expect(service.farmsState().data).toEqual(response);
    expect(service.farmsState().httpStatus).toBe(HttpStatusCode.Ok);
  });

  it('should keep previous farms when loadFarms fails', () => {
    const previousFarms = [
      {
        id: 9,
        firmware_version: '0.9.0',
        created_at: '2025-12-31T00:00:00Z',
        updated_at: '2025-12-31T00:00:00Z',
      },
    ];

    service.farmsState.set(successState(previousFarms, HttpStatusCode.Ok));

    service.loadFarms();

    const request = httpController.expectOne(`${API_BASE_URL}/farms`);
    request.flush(
      { message: 'Could not load farms.' },
      {
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      },
    );

    expect(service.farmsState().status).toBe('error');
    expect(service.farmsState().data).toEqual(previousFarms);
    expect(service.farmsState().httpStatus).toBe(HttpStatusCode.InternalServerError);
    expect(service.farmsState().errorMessage).toBe('Could not load farms.');
  });

  it('should create a farm', () => {
    const payload = { version: '1.0.1' };

    service.create(payload).subscribe((farm) => {
      expect(farm.firmware_version).toBe('1.0.1');
    });

    const request = httpController.expectOne(`${API_BASE_URL}/farms`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      id: 3,
      firmware_version: '1.0.1',
      created_at: '2026-01-03T00:00:00Z',
      updated_at: '2026-01-03T00:00:00Z',
    });
  });
});

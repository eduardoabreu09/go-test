import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { successState } from '../model/request-state';

import { FirmwareService } from './firmware';

describe('FirmwareService', () => {
  let service: FirmwareService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FirmwareService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list firmwares', () => {
    const response = [
      {
        version: '1.0.0',
        url: 'https://cdn.example.com/1.0.0.bin',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];

    service.getAllFirmwares().subscribe((firmwares) => {
      expect(firmwares).toEqual(response);
    });

    const request = httpController.expectOne(`${API_BASE_URL}/firmwares`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should load firmwares into firmwaresState', () => {
    const previousFirmwares = [
      {
        version: '0.9.0',
        url: 'https://cdn.example.com/0.9.0.bin',
        created_at: '2025-12-31T00:00:00Z',
      },
    ];
    const response = [
      {
        version: '1.0.0',
        url: 'https://cdn.example.com/1.0.0.bin',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];

    service.firmwaresState.set(successState(previousFirmwares, HttpStatusCode.Ok));

    service.loadFirmwares();

    expect(service.firmwaresState().status).toBe('loading');
    expect(service.firmwaresState().data).toEqual(previousFirmwares);

    const request = httpController.expectOne(`${API_BASE_URL}/firmwares`);
    expect(request.request.method).toBe('GET');
    request.flush(response);

    expect(service.firmwaresState().status).toBe('success');
    expect(service.firmwaresState().data).toEqual(response);
    expect(service.firmwaresState().httpStatus).toBe(HttpStatusCode.Ok);
  });

  it('should keep previous firmwares when loadFirmwares fails', () => {
    const previousFirmwares = [
      {
        version: '0.9.0',
        url: 'https://cdn.example.com/0.9.0.bin',
        created_at: '2025-12-31T00:00:00Z',
      },
    ];

    service.firmwaresState.set(successState(previousFirmwares, HttpStatusCode.Ok));

    service.loadFirmwares();

    const request = httpController.expectOne(`${API_BASE_URL}/firmwares`);
    request.flush(
      { message: 'Could not load firmwares.' },
      {
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      },
    );

    expect(service.firmwaresState().status).toBe('error');
    expect(service.firmwaresState().data).toEqual(previousFirmwares);
    expect(service.firmwaresState().httpStatus).toBe(HttpStatusCode.InternalServerError);
    expect(service.firmwaresState().errorMessage).toBe('Could not load firmwares.');
  });

  it('should fetch the latest firmware', () => {
    service.getLast().subscribe((firmware) => {
      expect(firmware.version).toBe('1.0.2');
    });

    const request = httpController.expectOne(`${API_BASE_URL}/firmwares/last`);
    expect(request.request.method).toBe('GET');
    request.flush({
      version: '1.0.2',
      url: 'https://cdn.example.com/1.0.2.bin',
      created_at: '2026-01-02T00:00:00Z',
    });
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';

import { FirmwareService } from './firmware';

describe('Firmware', () => {
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

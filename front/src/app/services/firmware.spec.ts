import { TestBed } from '@angular/core/testing';

import { FirmwareService } from './firmware';

describe('Firmware', () => {
  let service: FirmwareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirmwareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

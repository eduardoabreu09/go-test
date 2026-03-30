import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Firmware } from '../model/firmware';

@Injectable({
  providedIn: 'root',
})
export class FirmwareService {
  http = inject(HttpClient);

  getAllFirmwares() {
    const url = `http://localhost:8080/firmwares`;
    return this.http.get<Firmware[]>(url);
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Firmware } from '../model/firmware';
import { CreateFirmwarePayload } from '../model/payloads';
import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root',
})
export class FirmwareService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/firmwares`;

  getAllFirmwares() {
    return this.http.get<Firmware[]>(this.endpoint);
  }

  getByVersion(version: string) {
    return this.http.get<Firmware>(`${this.endpoint}/${version}`);
  }

  getLast() {
    return this.http.get<Firmware>(`${this.endpoint}/last`);
  }

  create(payload: CreateFirmwarePayload) {
    return this.http.post<Firmware>(this.endpoint, payload);
  }
}

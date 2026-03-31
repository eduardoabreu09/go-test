import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Farm } from '../model/farm';
import { CreateFarmPayload } from '../model/payloads';
import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root',
})
export class FarmService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/farms`;

  getAllFarms() {
    return this.http.get<Farm[]>(this.endpoint);
  }

  getById(id: number) {
    return this.http.get<Farm>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateFarmPayload) {
    return this.http.post<Farm>(this.endpoint, payload);
  }

  deleteFarm(id: number) {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../core/api.config';
import { CreateUpdatePayload } from '../model/payloads';
import { DownloadStatus } from '../model/status';
import { FarmUpdate } from '../model/update';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/updates`;

  create(payload: CreateUpdatePayload) {
    return this.http.post<FarmUpdate>(this.endpoint, payload);
  }

  listByStatus(status: DownloadStatus) {
    return this.http.get<FarmUpdate[]>(`${this.endpoint}?status=${status}`);
  }

  checkUpdate(farmId: number) {
    return this.http.get<FarmUpdate>(`${this.endpoint}/${farmId}/check`);
  }

  completeUpdate(id: number) {
    return this.http.put<FarmUpdate>(`${this.endpoint}/${id}/complete`, {});
  }
}

import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../core/api.config';
import { CreateUpdatePayload } from '../model/payloads';
import { DownloadStatus } from '../model/status';
import { FarmUpdate } from '../model/update';
import { errorState, loadingState, RequestState, successState } from '../model/request-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage, getErrorStatus } from '../core/http';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/updates`;
  private readonly destroyRef = inject(DestroyRef);

  readonly updatesState = signal<RequestState<FarmUpdate[]>>(loadingState([]));

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

  loadUpdates(status: DownloadStatus) {
    console.log('Loading Updates...');

    this.updatesState.set(loadingState(this.updatesState().data ?? []));

    this.listByStatus(status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updates) => {
          this.updatesState.set(successState(updates, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.updatesState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.updatesState().data),
          );
        },
      });
  }
}

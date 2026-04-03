import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Farm } from '../model/farm';
import { CreateFarmPayload } from '../model/payloads';
import { API_BASE_URL } from '../core/api.config';
import { errorState, loadingState, RequestState, successState } from '../model/request-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage, getErrorStatus } from '../core/http';

@Injectable({
  providedIn: 'root',
})
export class FarmService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/farms`;
  private readonly destroyRef = inject(DestroyRef);

  readonly farmsState = signal<RequestState<Farm[]>>(loadingState([]));

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

  loadFarms() {
    console.log('Loading Farms...');

    this.farmsState.set(loadingState(this.farmsState().data ?? []));

    this.getAllFarms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (farms) => {
          this.farmsState.set(successState(farms, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.farmsState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.farmsState().data),
          );
        },
      });
  }
}

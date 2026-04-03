import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Firmware } from '../model/firmware';
import { CreateFirmwarePayload } from '../model/payloads';
import { API_BASE_URL } from '../core/api.config';
import { errorState, loadingState, RequestState, successState } from '../model/request-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage, getErrorStatus } from '../core/http';

@Injectable({
  providedIn: 'root',
})
export class FirmwareService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/firmwares`;
  private readonly destroyRef = inject(DestroyRef);

  readonly firmwaresState = signal<RequestState<Firmware[]>>(loadingState([]));

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

  loadFirmwares() {
    console.log('Loading Firmwares...');

    this.firmwaresState.set(loadingState(this.firmwaresState().data ?? []));

    this.getAllFirmwares()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (firmwares) => {
          this.firmwaresState.set(successState(firmwares, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.firmwaresState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.firmwaresState().data),
          );
        },
      });
  }
}

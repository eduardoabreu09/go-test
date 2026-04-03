import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../core/api.config';
import { CreateUserPayload } from '../model/payloads';
import { User } from '../model/user';
import { errorState, loadingState, RequestState, successState } from '../model/request-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage, getErrorStatus } from '../core/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/users`;
  private readonly destroyRef = inject(DestroyRef);

  readonly usersState = signal<RequestState<User[]>>(loadingState([]));

  getAllUsers() {
    return this.http.get<User[]>(this.endpoint);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateUserPayload) {
    return this.http.post<User>(this.endpoint, payload);
  }

  loadUsers() {
    console.log('Loading Users...');

    this.usersState.set(loadingState(this.usersState().data ?? []));

    this.getAllUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.usersState.set(successState(users, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.usersState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.usersState().data),
          );
        },
      });
  }
}

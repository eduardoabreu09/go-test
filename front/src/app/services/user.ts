import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../core/api.config';
import { CreateUserPayload } from '../model/payloads';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/users`;

  getAllUsers() {
    return this.http.get<User[]>(this.endpoint);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateUserPayload) {
    return this.http.post<User>(this.endpoint, payload);
  }
}

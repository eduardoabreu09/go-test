import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Farm } from '../model/farm';

@Injectable({
  providedIn: 'root',
})
export class FarmService {
  http = inject(HttpClient);

  getAllFarms() {
    const url = `http://localhost:8080/farms`;
    return this.http.get<Farm[]>(url);
  }
}

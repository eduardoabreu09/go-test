import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { UserService } from './user';

describe('UserService', () => {
  let service: UserService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should create a user', () => {
    const payload = {
      name: 'Morgan Lee',
      email: 'morgan@example.com',
    };

    service.create(payload).subscribe((user) => {
      expect(user.id).toBe(11);
      expect(user.email).toBe(payload.email);
    });

    const request = httpController.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      id: 11,
      name: payload.name,
      email: payload.email,
      created_at: '2026-01-03T00:00:00Z',
    });
  });
});

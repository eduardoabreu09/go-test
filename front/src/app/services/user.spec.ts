import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { successState } from '../model/request-state';
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

  it('should load users into usersState', () => {
    const previousUsers = [
      {
        id: 2,
        name: 'Existing User',
        email: 'existing@example.com',
        created_at: '2026-01-02T00:00:00Z',
      },
    ];
    const response = [
      {
        id: 1,
        name: 'Eduardo',
        email: 'eduardo@example.com',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];

    service.usersState.set(successState(previousUsers, HttpStatusCode.Ok));

    service.loadUsers();

    expect(service.usersState().status).toBe('loading');
    expect(service.usersState().data).toEqual(previousUsers);

    const request = httpController.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.method).toBe('GET');
    request.flush(response);

    expect(service.usersState().status).toBe('success');
    expect(service.usersState().data).toEqual(response);
    expect(service.usersState().httpStatus).toBe(HttpStatusCode.Ok);
  });

  it('should keep previous users when loadUsers fails', () => {
    const previousUsers = [
      {
        id: 2,
        name: 'Existing User',
        email: 'existing@example.com',
        created_at: '2026-01-02T00:00:00Z',
      },
    ];

    service.usersState.set(successState(previousUsers, HttpStatusCode.Ok));

    service.loadUsers();

    const request = httpController.expectOne(`${API_BASE_URL}/users`);
    request.flush(
      { message: 'Could not load users.' },
      {
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      },
    );

    expect(service.usersState().status).toBe('error');
    expect(service.usersState().data).toEqual(previousUsers);
    expect(service.usersState().httpStatus).toBe(HttpStatusCode.InternalServerError);
    expect(service.usersState().errorMessage).toBe('Could not load users.');
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserForm } from './user-form';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.config';
import { provideHttpClient } from '@angular/common/http';

describe('UserForm', () => {
  let component: UserForm;
  let fixture: ComponentFixture<UserForm>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserForm);
    httpController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the user form and reset on success', () => {
    fixture.detectChanges();

    component.userForm.setValue({
      name: 'Morgan Lee',
      email: 'morgan@example.com',
    });

    component.submitUserForm();

    const request = httpController.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.method).toBe('POST');
    request.flush({
      id: 7,
      name: 'Morgan Lee',
      email: 'morgan@example.com',
      created_at: '2026-01-03T00:00:00Z',
    });

    expect(component.userRequest().status).toBe('success');
    expect(component.userForm.getRawValue()).toEqual({
      name: '',
      email: '',
    });
  });
});

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  errorState,
  idleState,
  loadingState,
  RequestState,
  successState,
} from '../../model/request-state';
import { User } from '../../model/user';
import { UserService } from '../../services/user';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpStatusCode } from '@angular/common/http';
import { getErrorMessage, getErrorStatus } from '../../core/http';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  readonly userRequest = signal<RequestState<User>>(idleState());
  readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
  });

  submitUserForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.userRequest.set(loadingState());

    this.userService.create(this.userForm.getRawValue()).subscribe({
      next: (user) => {
        this.userRequest.set(successState(user, HttpStatusCode.Created));
        this.userForm.reset({ name: '', email: '' });
      },
      error: (error: unknown) => {
        this.userRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
      },
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirmwareService } from '../../services/firmware';
import {
  errorState,
  idleState,
  loadingState,
  RequestState,
  successState,
} from '../../model/request-state';
import { Firmware } from '../../model/firmware';
import { HttpStatusCode } from '@angular/common/http';
import { getErrorMessage, getErrorStatus } from '../../core/http';

@Component({
  selector: 'app-firmware-form',
  imports: [ReactiveFormsModule],
  templateUrl: './firmware-form.html',
  styleUrl: './firmware-form.css',
})
export class FirmwareForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly firmwareService = inject(FirmwareService);

  readonly firmwareForm = this.formBuilder.nonNullable.group({
    version: ['', [Validators.required, Validators.maxLength(100)]],
    url: ['', [Validators.required]],
  });
  readonly firmwareRequest = signal<RequestState<Firmware>>(idleState());

  submitFirmwareForm() {
    if (this.firmwareForm.invalid) {
      this.firmwareForm.markAllAsTouched();
      return;
    }

    this.firmwareRequest.set(loadingState());

    this.firmwareService.create(this.firmwareForm.getRawValue()).subscribe({
      next: (firmware) => {
        this.firmwareRequest.set(successState(firmware, HttpStatusCode.Created));
        this.firmwareForm.reset({ version: '', url: '' });
        this.firmwareService.loadFirmwares();
      },
      error: (error: unknown) => {
        this.firmwareRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
      },
    });
  }
}

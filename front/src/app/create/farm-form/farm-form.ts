import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FarmService } from '../../services/farm';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirmwareService } from '../../services/firmware';
import {
  errorState,
  idleState,
  loadingState,
  RequestState,
  successState,
} from '../../model/request-state';
import { Farm } from '../../model/farm';
import { HttpStatusCode } from '@angular/common/http';
import { getErrorMessage, getErrorStatus } from '../../core/http';

@Component({
  selector: 'app-farm-form',
  imports: [ReactiveFormsModule],
  templateUrl: './farm-form.html',
  styleUrl: './farm-form.css',
})
export class FarmForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly farmService = inject(FarmService);

  readonly firmwareService = inject(FirmwareService);
  readonly farmForm = this.formBuilder.nonNullable.group({
    version: ['', [Validators.required]],
  });
  readonly farmRequest = signal<RequestState<Farm>>(idleState());
  readonly firmwares = computed(() => this.firmwareService.firmwaresState().data ?? []);

  ngOnInit(): void {
    this.firmwareService.loadFirmwares();
  }

  submitFarmForm() {
    if (this.farmForm.invalid) {
      this.farmForm.markAllAsTouched();
      return;
    }

    this.farmRequest.set(loadingState());

    this.farmService.create(this.farmForm.getRawValue()).subscribe({
      next: (farm) => {
        this.farmRequest.set(successState(farm, HttpStatusCode.Created));
        this.farmForm.reset({ version: '' });
        this.farmService.loadFarms();
      },
      error: (error: unknown) => {
        this.farmRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
      },
    });
  }
}

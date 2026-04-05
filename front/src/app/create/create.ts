import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { getErrorMessage, getErrorStatus } from '../core/http';
import {
  errorState,
  idleState,
  loadingState,
  RequestState,
  successState,
} from '../model/request-state';
import { FarmUpdate } from '../model/update';
import { FirmwareService } from '../services/firmware';
import { FarmService } from '../services/farm';
import { UpdateService } from '../services/update';
import { HttpStatusCode } from '@angular/common/http';
import { FormHeader } from '../components/form-header/form-header';
import { UserForm } from './user-form/user-form';
import { FirmwareForm } from './firmware-form/firmware-form';
import { FarmForm } from './farm-form/farm-form';

@Component({
  selector: 'app-create-page',
  imports: [ReactiveFormsModule, FormHeader, UserForm, FirmwareForm, FarmForm],
  templateUrl: './create.html',
  styleUrl: './create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly firmwareService = inject(FirmwareService);
  private readonly farmService = inject(FarmService);
  private readonly updateService = inject(UpdateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly updateForm = this.formBuilder.nonNullable.group({
    farmId: [0, [Validators.min(1)]],
    firmwareVersion: ['', [Validators.required]],
  });

  readonly updateRequest = signal<RequestState<FarmUpdate>>(idleState());

  readonly farms = computed(() => this.farmService.farmsState().data ?? []);
  readonly firmwares = computed(() => this.firmwareService.firmwaresState().data ?? []);

  private readonly selectedFarmId = toSignal(
    this.updateForm.controls.farmId.valueChanges.pipe(
      startWith(this.updateForm.controls.farmId.getRawValue()),
    ),
    { initialValue: this.updateForm.controls.farmId.getRawValue() },
  );

  readonly selectedFarm = computed(
    () => this.farms().find((farm) => farm.id === this.selectedFarmId()) ?? null,
  );

  readonly availableTargetFirmwares = computed(() => {
    const farm = this.selectedFarm();

    if (!farm) {
      return [];
    }

    return this.firmwares().filter((firmware) => firmware.version !== farm.firmware_version);
  });

  constructor() {
    this.loadOptions();
  }

  loadOptions() {
    this.farmService.loadFarms();
  }

  onUpdateFarmChange() {
    this.updateForm.controls.firmwareVersion.setValue('');
  }

  submitUpdateForm() {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.updateRequest.set(loadingState());

    const formValue = this.updateForm.getRawValue();

    this.updateService
      .create({
        farm_id: formValue.farmId,
        firmware_version: formValue.firmwareVersion,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (update) => {
          this.updateRequest.set(successState(update, HttpStatusCode.Created));
          this.updateForm.reset({ farmId: 0, firmwareVersion: '' });
        },
        error: (error: unknown) => {
          this.updateRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
        },
      });
  }
}

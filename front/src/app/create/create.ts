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
import { Farm } from '../model/farm';
import { Firmware } from '../model/firmware';
import {
  errorState,
  idleState,
  loadingState,
  RequestState,
  successState,
} from '../model/request-state';
import { FarmUpdate } from '../model/update';
import { User } from '../model/user';
import { FirmwareService } from '../services/firmware';
import { FarmService } from '../services/farm';
import { UpdateService } from '../services/update';
import { UserService } from '../services/user';
import { HttpStatusCode } from '@angular/common/http';

type CreateOptionsState = {
  farms: Farm[];
  firmwares: Firmware[];
};

@Component({
  selector: 'app-create-page',
  imports: [ReactiveFormsModule],
  templateUrl: './create.html',
  styleUrl: './create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly firmwareService = inject(FirmwareService);
  private readonly farmService = inject(FarmService);
  private readonly updateService = inject(UpdateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly firmwareForm = this.formBuilder.nonNullable.group({
    version: ['', [Validators.required, Validators.maxLength(100)]],
    url: ['', [Validators.required]],
  });

  readonly farmForm = this.formBuilder.nonNullable.group({
    version: ['', [Validators.required]],
  });

  readonly updateForm = this.formBuilder.nonNullable.group({
    farmId: [0, [Validators.min(1)]],
    firmwareVersion: ['', [Validators.required]],
  });

  readonly optionsState = signal<RequestState<CreateOptionsState>>(
    loadingState({ farms: [], firmwares: [] }),
  );
  readonly userRequest = signal<RequestState<User>>(idleState());
  readonly firmwareRequest = signal<RequestState<Firmware>>(idleState());
  readonly farmRequest = signal<RequestState<Farm>>(idleState());
  readonly updateRequest = signal<RequestState<FarmUpdate>>(idleState());

  readonly farms = computed(() => this.optionsState().data?.farms ?? []);
  readonly firmwares = computed(() => this.optionsState().data?.firmwares ?? []);

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
    this.optionsState.set(loadingState(this.optionsState().data));

    this.farmService
      .getAllFarms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (farms) => {
          this.optionsState.update((state) =>
            successState({ farms, firmwares: state.data?.firmwares ?? [] }, HttpStatusCode.Ok),
          );
          this.syncUpdateSelection();
        },
        error: (error: unknown) => {
          this.optionsState.update((state) =>
            errorState(
              getErrorMessage(error),
              getErrorStatus(error),
              state.data ?? { farms: [], firmwares: [] },
            ),
          );
        },
      });

    this.firmwareService
      .getAllFirmwares()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (firmwares) => {
          this.optionsState.update((state) =>
            successState({ farms: state.data?.farms ?? [], firmwares }, HttpStatusCode.Ok),
          );
          this.syncUpdateSelection();
        },
        error: (error: unknown) => {
          this.optionsState.update((state) =>
            errorState(
              getErrorMessage(error),
              getErrorStatus(error),
              state.data ?? { farms: [], firmwares: [] },
            ),
          );
        },
      });
  }

  onUpdateFarmChange() {
    this.updateForm.controls.firmwareVersion.setValue('');
  }

  submitUserForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.userRequest.set(loadingState());

    this.userService
      .create(this.userForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.userRequest.set(successState(user, HttpStatusCode.Created));
          this.userForm.reset({ name: '', email: '' });
        },
        error: (error: unknown) => {
          this.userRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
        },
      });
  }

  submitFirmwareForm() {
    if (this.firmwareForm.invalid) {
      this.firmwareForm.markAllAsTouched();
      return;
    }

    this.firmwareRequest.set(loadingState());

    this.firmwareService
      .create(this.firmwareForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (firmware) => {
          this.firmwareRequest.set(successState(firmware, HttpStatusCode.Created));
          this.firmwareForm.reset({ version: '', url: '' });
          this.reloadFirmwares();
        },
        error: (error: unknown) => {
          this.firmwareRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
        },
      });
  }

  submitFarmForm() {
    if (this.farmForm.invalid) {
      this.farmForm.markAllAsTouched();
      return;
    }

    this.farmRequest.set(loadingState());

    this.farmService
      .create(this.farmForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (farm) => {
          this.farmRequest.set(successState(farm, HttpStatusCode.Created));
          this.farmForm.reset({ version: '' });
          this.reloadFarms();
        },
        error: (error: unknown) => {
          this.farmRequest.set(errorState(getErrorMessage(error), getErrorStatus(error)));
        },
      });
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

  private reloadFarms() {
    this.farmService
      .getAllFarms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (farms) => {
          this.optionsState.update((state) =>
            successState({ farms, firmwares: state.data?.firmwares ?? [] }, HttpStatusCode.Ok),
          );
          this.syncUpdateSelection();
        },
        error: (error: unknown) => {
          this.optionsState.update((state) =>
            errorState(
              getErrorMessage(error),
              getErrorStatus(error),
              state.data ?? { farms: [], firmwares: [] },
            ),
          );
        },
      });
  }

  private reloadFirmwares() {
    this.firmwareService
      .getAllFirmwares()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (firmwares) => {
          this.optionsState.update((state) =>
            successState({ farms: state.data?.farms ?? [], firmwares }, HttpStatusCode.Ok),
          );
          this.syncUpdateSelection();
        },
        error: (error: unknown) => {
          this.optionsState.update((state) =>
            errorState(
              getErrorMessage(error),
              getErrorStatus(error),
              state.data ?? { farms: [], firmwares: [] },
            ),
          );
        },
      });
  }

  private syncUpdateSelection() {
    const farmId = this.updateForm.controls.farmId.getRawValue();
    const farmExists = this.farms().some((farm) => farm.id === farmId);

    if (!farmExists) {
      this.updateForm.controls.farmId.setValue(0);
      this.updateForm.controls.firmwareVersion.setValue('');
      return;
    }

    const version = this.updateForm.controls.firmwareVersion.getRawValue();
    const versionIsAvailable = this.availableTargetFirmwares().some(
      (firmware) => firmware.version === version,
    );

    if (!versionIsAvailable) {
      this.updateForm.controls.firmwareVersion.setValue('');
    }
  }
}

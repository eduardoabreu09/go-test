import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { errorState, loadingState, RequestState, successState } from '../model/request-state';
import { FarmUpdate } from '../model/update';
import { DownloadStatus, isDownloadStatus } from '../model/status';
import { User } from '../model/user';
import { Firmware } from '../model/firmware';
import { Farm } from '../model/farm';
import { FirmwareService } from '../services/firmware';
import { FarmService } from '../services/farm';
import { UpdateService } from '../services/update';
import { UserService } from '../services/user';
import { getErrorMessage, getErrorStatus } from '../core/http';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly userService = inject(UserService);
  private readonly firmwareService = inject(FirmwareService);
  private readonly farmService = inject(FarmService);
  private readonly updateService = inject(UpdateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly usersState = signal<RequestState<User[]>>(loadingState([]));
  readonly firmwaresState = signal<RequestState<Firmware[]>>(loadingState([]));
  readonly farmsState = signal<RequestState<Farm[]>>(loadingState([]));
  readonly updatesState = signal<RequestState<FarmUpdate[]>>(loadingState([]));
  readonly selectedUpdateStatus = signal<DownloadStatus>('PENDING');

  readonly updateStatusOptions: { label: string; value: DownloadStatus }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Error', value: 'ERROR' },
  ];

  constructor() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loadUsers();
    this.loadFirmwares();
    this.loadFarms();
    this.loadUpdates();
  }

  onUpdateStatusChange(rawStatus: string) {
    if (!isDownloadStatus(rawStatus) || rawStatus === this.selectedUpdateStatus()) {
      return;
    }

    this.selectedUpdateStatus.set(rawStatus);
    this.loadUpdates();
  }

  private loadUsers() {
    this.usersState.set(loadingState(this.usersState().data ?? []));

    this.userService
      .getAllUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.usersState.set(successState(users, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.usersState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.usersState().data),
          );
        },
      });
  }

  private loadFirmwares() {
    this.firmwaresState.set(loadingState(this.firmwaresState().data ?? []));

    this.firmwareService
      .getAllFirmwares()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (firmwares) => {
          this.firmwaresState.set(successState(firmwares, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.firmwaresState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.firmwaresState().data),
          );
        },
      });
  }

  private loadFarms() {
    this.farmsState.set(loadingState(this.farmsState().data ?? []));

    this.farmService
      .getAllFarms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (farms) => {
          this.farmsState.set(successState(farms, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.farmsState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.farmsState().data),
          );
        },
      });
  }

  private loadUpdates() {
    this.updatesState.set(loadingState(this.updatesState().data ?? []));

    this.updateService
      .listByStatus(this.selectedUpdateStatus())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updates) => {
          this.updatesState.set(successState(updates, HttpStatusCode.Ok));
        },
        error: (error: unknown) => {
          this.updatesState.set(
            errorState(getErrorMessage(error), getErrorStatus(error), this.updatesState().data),
          );
        },
      });
  }
}

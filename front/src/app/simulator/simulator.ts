import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timer } from 'rxjs';
import { getErrorMessage, getErrorStatus } from '../core/http';
import { Farm } from '../model/farm';
import { createSimulatorFarmState, SimulatorFarmState, SimulatorStatus } from '../model/simulator';
import { errorState, loadingState, RequestState, successState } from '../model/request-state';
import { FarmService } from '../services/farm';
import { UpdateService } from '../services/update';

@Component({
  selector: 'app-simulator-page',
  imports: [DatePipe],
  templateUrl: './simulator.html',
  styleUrl: './simulator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorPage {
  private readonly farmService = inject(FarmService);
  private readonly updateService = inject(UpdateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly farmsState = signal<RequestState<Farm[]>>(loadingState([]));
  readonly selectedFarmIds = signal<ReadonlySet<number>>(new Set<number>());
  readonly simulatorStates = signal<Record<number, SimulatorFarmState>>({});

  private readonly pollingSubscriptions = new Map<number, { unsubscribe(): void }>();
  private readonly completionTimeouts = new Map<number, number>();
  private readonly checkingFarmIds = new Set<number>();

  readonly selectedCount = computed(() => this.selectedFarmIds().size);

  constructor() {
    this.loadFarms();
    this.destroyRef.onDestroy(() => this.stopAll());
  }

  loadFarms(showLoader = true) {
    if (showLoader) {
      this.farmsState.set(loadingState(this.farmsState().data ?? []));
    }

    this.farmService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (farms) => {
          this.syncSimulatorStates(farms);
          this.farmsState.set(successState(farms, 200));
        },
        error: (error: unknown) => {
          this.farmsState.set(errorState(getErrorMessage(error), getErrorStatus(error), this.farmsState().data));
        },
      });
  }

  onFarmSelectionChange(farmId: number, event: Event) {
    const input = event.target as HTMLInputElement;

    this.selectedFarmIds.update((selectedIds) => {
      const nextIds = new Set(selectedIds);

      if (input.checked) {
        nextIds.add(farmId);
      } else {
        nextIds.delete(farmId);
      }

      return nextIds;
    });
  }

  startSelected() {
    for (const farmId of this.selectedFarmIds()) {
      this.startSimulation(farmId);
    }
  }

  stopSelected() {
    for (const farmId of this.selectedFarmIds()) {
      this.stopSimulation(farmId);
    }
  }

  stopAll() {
    const activeFarmIds = Array.from(this.pollingSubscriptions.keys());

    for (const farmId of activeFarmIds) {
      this.stopSimulation(farmId);
    }
  }

  getFarmState(farmId: number) {
    return this.simulatorStates()[farmId] ?? createSimulatorFarmState(farmId);
  }

  isSelected(farmId: number) {
    return this.selectedFarmIds().has(farmId);
  }

  isRunning(farmId: number) {
    return this.pollingSubscriptions.has(farmId);
  }

  statusLabel(status: SimulatorStatus) {
    switch (status) {
      case 'polling':
        return 'Polling';
      case 'no-update':
        return 'No update';
      case 'updating':
        return 'Updating';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      case 'stopped':
        return 'Stopped';
      default:
        return 'Idle';
    }
  }

  startSimulation(farmId: number) {
    if (this.pollingSubscriptions.has(farmId)) {
      return;
    }

    this.setFarmState(farmId, {
      status: 'polling',
      message: 'Checking for pending updates every 30 seconds.',
      scheduledDelayMs: null,
    });

    const subscription = timer(0, 30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.getFarmState(farmId).status === 'updating' || this.checkingFarmIds.has(farmId)) {
          return;
        }

        this.checkForUpdate(farmId);
      });

    this.pollingSubscriptions.set(farmId, subscription);
  }

  stopSimulation(farmId: number) {
    this.pollingSubscriptions.get(farmId)?.unsubscribe();
    this.pollingSubscriptions.delete(farmId);

    const timeoutId = this.completionTimeouts.get(farmId);

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      this.completionTimeouts.delete(farmId);
    }

    this.setFarmState(farmId, {
      status: 'stopped',
      pendingUpdateId: null,
      scheduledDelayMs: null,
      message: 'Simulation stopped.',
    });
  }

  private checkForUpdate(farmId: number) {
    this.checkingFarmIds.add(farmId);

    this.setFarmState(farmId, {
      status: 'polling',
      lastCheckedAt: new Date().toISOString(),
      message: 'Checking for pending updates...',
      pendingUpdateId: null,
    });

    this.updateService
      .checkUpdate(farmId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.checkingFarmIds.delete(farmId);
        }),
      )
      .subscribe({
        next: (update) => {
          const scheduledDelayMs = this.generateUpdateDelayMs();

          this.setFarmState(farmId, {
            status: 'updating',
            pendingUpdateId: update.id,
            scheduledDelayMs,
            message: `Update ${update.firmware_version} found. Applying in ${this.toSecondsLabel(scheduledDelayMs)}.`,
          });

          const timeoutId = window.setTimeout(() => {
            this.completionTimeouts.delete(farmId);
            this.completeUpdate(farmId, update.id);
          }, scheduledDelayMs);

          this.completionTimeouts.set(farmId, timeoutId);
        },
        error: () => {
          this.setFarmState(farmId, {
            status: 'no-update',
            pendingUpdateId: null,
            scheduledDelayMs: null,
            message: 'No pending updates found on the last check.',
          });
        },
      });
  }

  private completeUpdate(farmId: number, updateId: number) {
    this.updateService
      .completeUpdate(updateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (update) => {
          this.setFarmState(farmId, {
            status: 'completed',
            lastCheckedAt: new Date().toISOString(),
            pendingUpdateId: null,
            scheduledDelayMs: null,
            message: `Farm updated to firmware ${update.firmware_version}.`,
          });

          this.loadFarms(false);
        },
        error: (error: unknown) => {
          this.setFarmState(farmId, {
            status: 'error',
            lastCheckedAt: new Date().toISOString(),
            pendingUpdateId: null,
            scheduledDelayMs: null,
            message: getErrorMessage(error),
          });
        },
      });
  }

  private generateUpdateDelayMs() {
    return (Math.floor(Math.random() * 16) + 5) * 1000;
  }

  private toSecondsLabel(delayMs: number) {
    return `${Math.round(delayMs / 1000)} seconds`;
  }

  private setFarmState(farmId: number, partialState: Partial<SimulatorFarmState>) {
    this.simulatorStates.update((currentStates) => ({
      ...currentStates,
      [farmId]: {
        ...(currentStates[farmId] ?? createSimulatorFarmState(farmId)),
        ...partialState,
      },
    }));
  }

  private syncSimulatorStates(farms: Farm[]) {
    const validFarmIds = new Set(farms.map((farm) => farm.id));

    for (const farmId of this.pollingSubscriptions.keys()) {
      if (!validFarmIds.has(farmId)) {
        this.stopSimulation(farmId);
      }
    }

    this.selectedFarmIds.update((selectedIds) => {
      const nextIds = new Set<number>();

      for (const farmId of selectedIds) {
        if (validFarmIds.has(farmId)) {
          nextIds.add(farmId);
        }
      }

      return nextIds;
    });

    this.simulatorStates.update((currentStates) => {
      const nextStates: Record<number, SimulatorFarmState> = {};

      for (const farm of farms) {
        nextStates[farm.id] = currentStates[farm.id] ?? createSimulatorFarmState(farm.id);
      }

      return nextStates;
    });
  }
}

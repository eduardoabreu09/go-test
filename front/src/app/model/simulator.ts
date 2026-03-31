export type SimulatorStatus = 'idle' | 'polling' | 'no-update' | 'updating' | 'completed' | 'error' | 'stopped';

export type SimulatorFarmState = {
  farmId: number;
  status: SimulatorStatus;
  lastCheckedAt: string | null;
  pendingUpdateId: number | null;
  scheduledDelayMs: number | null;
  message: string;
};

export function createSimulatorFarmState(farmId: number): SimulatorFarmState {
  return {
    farmId,
    status: 'idle',
    lastCheckedAt: null,
    pendingUpdateId: null,
    scheduledDelayMs: null,
    message: 'Ready to start.',
  };
}

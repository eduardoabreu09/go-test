import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api.config';
import { SimulatorPage } from './simulator';
import { vi } from 'vitest';

function checkboxEvent(checked: boolean): Event {
  return {
    target: {
      checked,
    },
  } as unknown as Event;
}

describe('SimulatorPage', () => {
  let component: SimulatorPage;
  let fixture: ComponentFixture<SimulatorPage>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [SimulatorPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SimulatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpController.expectOne(`${API_BASE_URL}/farms`).flush([
      {
        id: 1,
        firmware_version: '1.0.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);
  });

  afterEach(() => {
    httpController.verify();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should complete a pending update after the simulated delay', async () => {
    component.onFarmSelectionChange(1, checkboxEvent(true));
    component.startSelected();

    await vi.advanceTimersByTimeAsync(0);

    httpController.expectOne(`${API_BASE_URL}/updates/1/check`).flush({
      id: 99,
      status: { download_status: 'PENDING', valid: true },
      firmware_version: '1.1.0',
      farm_id: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });

    const scheduledDelayMs = component.getFarmState(1).scheduledDelayMs;
    expect(scheduledDelayMs).not.toBeNull();
    expect(scheduledDelayMs).toBeGreaterThanOrEqual(5_000);
    expect(scheduledDelayMs).toBeLessThanOrEqual(20_000);

    await vi.advanceTimersByTimeAsync((scheduledDelayMs ?? 0) - 1);
    httpController.expectNone(`${API_BASE_URL}/updates/99/complete`);

    await vi.advanceTimersByTimeAsync(1);

    const completionRequest = httpController.expectOne(`${API_BASE_URL}/updates/99/complete`);
    expect(completionRequest.request.method).toBe('PUT');
    completionRequest.flush({
      id: 99,
      status: { download_status: 'COMPLETED', valid: true },
      firmware_version: '1.1.0',
      farm_id: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:10Z',
    });

    httpController.expectOne(`${API_BASE_URL}/farms`).flush([
      {
        id: 1,
        firmware_version: '1.1.0',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:10Z',
      },
    ]);

    expect(component.getFarmState(1).status).toBe('completed');

    component.stopAll();
  });

  it('should treat a failed check as no update available', async () => {
    component.onFarmSelectionChange(1, checkboxEvent(true));
    component.startSelected();

    await vi.advanceTimersByTimeAsync(0);

    httpController.expectOne(`${API_BASE_URL}/updates/1/check`).flush('no rows in result set', {
      status: 404,
      statusText: 'Not Found',
    });

    expect(component.getFarmState(1).status).toBe('no-update');
    expect(component.isRunning(1)).toBe(true);

    component.stopAll();
  });

  it('should cancel a pending completion timeout when stopped', async () => {
    component.onFarmSelectionChange(1, checkboxEvent(true));
    component.startSelected();

    await vi.advanceTimersByTimeAsync(0);

    httpController.expectOne(`${API_BASE_URL}/updates/1/check`).flush({
      id: 101,
      status: { download_status: 'PENDING', valid: true },
      firmware_version: '1.2.0',
      farm_id: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });

    const scheduledDelayMs = component.getFarmState(1).scheduledDelayMs;
    expect(scheduledDelayMs).not.toBeNull();

    component.stopSelected();
    await vi.advanceTimersByTimeAsync(scheduledDelayMs ?? 0);

    httpController.expectNone(`${API_BASE_URL}/updates/101/complete`);
    expect(component.getFarmState(1).status).toBe('stopped');
  });
});

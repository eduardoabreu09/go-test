import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DownloadStatus, isDownloadStatus } from '../model/status';
import { FirmwareService } from '../services/firmware';
import { FarmService } from '../services/farm';
import { UpdateService } from '../services/update';
import { UserService } from '../services/user';
import { Data, Table } from '../components/table/table';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink, Table],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  readonly userService = inject(UserService);
  readonly firmwareService = inject(FirmwareService);
  readonly farmService = inject(FarmService);
  readonly updateService = inject(UpdateService);

  test = signal<boolean>(true);
  readonly selectedUpdateStatus = signal<DownloadStatus>('PENDING');
  readonly userTableData = computed<Data>(() => {
    return {
      title: 'GET /users',
      label: 'Users',
      headers: ['ID', 'Name', 'Email', 'Created'],
      values: new Map(
        (this.userService.usersState().data ?? []).map((user) => [
          user.id,
          [
            { value: String(user.id), isDate: false },
            { value: user.name, isDate: false },
            { value: user.email, isDate: false },
            { value: user.created_at, isDate: true },
          ],
        ]),
      ),
    };
  });
  readonly firmwareTableData = computed<Data>(() => {
    return {
      title: 'GET /firmwares',
      label: 'Firmwares',
      headers: ['Version', 'URL', 'Created'],
      values: new Map(
        (this.firmwareService.firmwaresState().data ?? []).map((firm, index) => [
          index,
          [
            { value: firm.version, isDate: false },
            { value: firm.url, isDate: false },
            { value: firm.created_at, isDate: true },
          ],
        ]),
      ),
    };
  });

  readonly farmTableData = computed<Data>(() => {
    return {
      title: 'GET /farms',
      label: 'Farms',
      headers: ['ID', 'Firmware', 'Created', 'Updated'],
      values: new Map(
        (this.farmService.farmsState().data ?? []).map((farm) => [
          farm.id,
          [
            { value: farm.id.toString(), isDate: false },
            { value: farm.firmware_version, isDate: false },
            { value: farm.created_at, isDate: true },
            { value: farm.updated_at, isDate: true },
          ],
        ]),
      ),
    };
  });

  readonly updateStatusOptions: { label: string; value: DownloadStatus }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Error', value: 'ERROR' },
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.userService.loadUsers();
    this.firmwareService.loadFirmwares();
    this.farmService.loadFarms();
    this.updateService.loadUpdates(this.selectedUpdateStatus());
  }

  onUpdateStatusChange(rawStatus: string) {
    if (!isDownloadStatus(rawStatus) || rawStatus === this.selectedUpdateStatus()) {
      return;
    }

    this.selectedUpdateStatus.set(rawStatus);
    this.updateService.loadUpdates(rawStatus);
  }
}

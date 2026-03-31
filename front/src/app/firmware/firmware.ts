import { Component, inject, OnInit, signal } from '@angular/core';
import { FirmwareService } from '../services/firmware';
import { Firmware } from '../model/firmware';
import { catchError } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-firmware',
  imports: [DatePipe],
  templateUrl: './firmware.html',
  styleUrl: './firmware.css',
})
export class FirmwareComponent implements OnInit {
  firmwareService = inject(FirmwareService);
  firmwares = signal<Firmware[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.firmwareService
      .getAllFirmwares()
      .pipe(
        catchError((err) => {
          console.log(err);
          this.isLoading.set(false);
          throw err;
        }),
      )
      .subscribe((firmwares) => {
        this.firmwares.set(firmwares);
        this.isLoading.set(false);
      });
  }
}

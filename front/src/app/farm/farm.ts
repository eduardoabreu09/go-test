import { Component, inject, OnInit, signal } from '@angular/core';
import { Farm } from '../model/farm';
import { FarmService } from '../services/farm';
import { DatePipe } from '@angular/common';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-farm',
  imports: [DatePipe],
  templateUrl: './farm.html',
  styleUrl: './farm.css',
})
export class FarmComponent implements OnInit {
  farms = signal<Farm[]>([]);
  isLoading = signal<boolean>(false);
  farmService = inject(FarmService);

  ngOnInit(): void {
    this.farmService
      .getAllFarms()
      .pipe(
        catchError((err) => {
          console.log(err);
          this.isLoading.set(false);
          throw err;
        }),
      )
      .subscribe((farms) => {
        this.farms.set(farms);
        this.isLoading.set(false);
      });
  }
}

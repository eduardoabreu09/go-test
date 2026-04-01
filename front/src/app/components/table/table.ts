import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

export interface Data {
  title: string;
  label: string;
  headers: string[];
  values: Map<
    number,
    {
      value: string;
      isDate: boolean;
    }[]
  >;
}

@Component({
  selector: 'app-table',
  imports: [DatePipe],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  isLoading = input.required<boolean>();
  error = input<string>('');
  data = input.required<Data>();
}

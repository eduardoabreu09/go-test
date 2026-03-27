import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter {
  value = signal(0);

  increment() {
    this.value.update((val) => val + 1);
  }
  decrement() {
    this.value.update((val) => val - 1);
  }
  reset() {
    this.value.set(0);
  }
}

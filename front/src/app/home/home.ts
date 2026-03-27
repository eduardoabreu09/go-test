import { Component } from '@angular/core';
import { Greetings } from '../components/greetings/greetings';
import { Counter } from '../components/counter/counter';

@Component({
  selector: 'app-home',
  imports: [Greetings, Counter],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  onChange(event: KeyboardEvent) {
    console.log(`user typed something`);
    console.log(event.key);
  }
}

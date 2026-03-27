import { Component, input } from '@angular/core';

@Component({
  selector: 'app-greetings',
  imports: [],
  templateUrl: './greetings.html',
  styleUrl: './greetings.css',
})
export class Greetings {
  message = input('Hello world');
}

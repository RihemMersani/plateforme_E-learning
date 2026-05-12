import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-take.component.html',
  styleUrl: './quiz-take.component.scss'
})
export class QuizTakeComponent {}

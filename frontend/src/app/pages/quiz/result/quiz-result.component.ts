import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss'
})
export class QuizResultComponent {}

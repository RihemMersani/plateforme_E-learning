import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.scss'
})
export class QuizListComponent {}

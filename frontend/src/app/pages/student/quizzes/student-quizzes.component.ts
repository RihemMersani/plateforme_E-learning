import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-quizzes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-quizzes.component.html',
  styleUrl: './student-quizzes.component.scss'
})
export class StudentQuizzesComponent {}

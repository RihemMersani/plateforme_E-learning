import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-student-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-quizzes.component.html',
  styleUrl: './student-quizzes.component.scss'
})
export class StudentQuizzesComponent implements OnInit {
  private api = inject(ApiService);
  quizzes: any[] = [];

  ngOnInit(): void {
    this.api.getStudentQuizzes().subscribe((quizzes) => this.quizzes = quizzes);
  }
}

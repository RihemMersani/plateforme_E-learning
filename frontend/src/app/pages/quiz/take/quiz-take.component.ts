import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quiz-take.component.html',
  styleUrl: './quiz-take.component.scss'
})
export class QuizTakeComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  quiz: any;
  currentIndex = 0;
  answers: Record<number, number> = {};
  errorMessage = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getQuiz(slug).subscribe((quiz) => this.quiz = quiz);
  }

  get currentQuestion(): any {
    return this.quiz?.questions?.[this.currentIndex];
  }

  previous(): void {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
  }

  next(): void {
    if (this.currentIndex < this.quiz.questions.length - 1) {
      this.currentIndex += 1;
      return;
    }
    this.submit();
  }

  submit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.submitQuiz(slug, this.answers).subscribe({
      next: () => this.router.navigate(['/quiz', slug, 'resultat']),
      error: (err) => this.errorMessage = err.error?.msg || 'Connecte-toi pour soumettre le quiz.'
    });
  }
}

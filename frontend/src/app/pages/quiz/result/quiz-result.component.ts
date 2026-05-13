import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss'
})
export class QuizResultComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  result: any;
  message = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getQuizResult(slug).subscribe({
      next: (result) => this.result = result,
      error: (err) => this.message = err.error?.msg || 'Aucun resultat pour ce quiz.'
    });
  }
}

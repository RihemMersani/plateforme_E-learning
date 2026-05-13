import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  course: any;
  message = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getCourse(slug).subscribe((course) => this.course = course);
  }

  enroll(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.enroll(slug).subscribe({
      next: () => this.router.navigate(['/cours', slug, 'lecture']),
      error: (err) => this.message = err.error?.msg || 'Connecte-toi pour commencer ce cours.'
    });
  }
}

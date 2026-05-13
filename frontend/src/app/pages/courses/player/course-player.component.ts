import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.scss'
})
export class CoursePlayerComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  course: any;
  lessons: any[] = [];
  activeLesson: any;
  message = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getCourse(slug).subscribe((course) => {
      this.course = course;
      this.lessons = course.chapters.flatMap((chapter: any) => chapter.lessons);
      this.activeLesson = this.lessons[0];
    });
  }

  selectLesson(lesson: any): void {
    this.activeLesson = lesson;
  }

  completeLesson(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.activeLesson) return;

    this.api.completeLesson(slug, this.activeLesson.id).subscribe({
      next: (result) => this.message = `Progression enregistree: ${result.progress}%`,
      error: (err) => this.message = err.error?.msg || 'Connecte-toi pour enregistrer ta progression.'
    });
  }
}

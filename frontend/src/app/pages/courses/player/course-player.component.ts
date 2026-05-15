import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

const ANGULAR_VIDEOS = [
  {
    title: 'Introduction a Angular',
    content: 'Decouvrir Angular, son role et les bases du framework.',
    video_url: '/assets/video_angular/Part1.mp4',
    duration_minutes: 18,
  },
  {
    title: 'Demarrer avec Angular',
    content: 'Installer le projet, comprendre la structure et lancer le serveur.',
    video_url: '/assets/video_angular/Part2.mp4',
    duration_minutes: 24,
  },
  {
    title: 'Composants Angular',
    content: 'Construire des composants propres, reutilisables et bien organises.',
    video_url: '/assets/video_angular/Part3.mp4',
    duration_minutes: 22,
  },
  {
    title: 'Personnaliser composants et directives',
    content: 'Adapter les composants et directives pour enrichir l interface.',
    video_url: '/assets/video_angular/Part4.mp4',
    duration_minutes: 28,
  },
];

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
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  course: any;
  lessons: any[] = [];
  activeLesson: any;
  activeIndex = 0;
  completedLessonIds = new Set<number>();
  quiz: any;
  message = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';

    this.api.getCourse(slug).subscribe((course) => {
      this.course = course;

      const lessons = course.chapters.flatMap((chapter: any) => chapter.lessons);
      this.lessons = this.withAngularVideos(lessons);

      this.completedLessonIds = this.loadCompletedLessons();
      this.activeLesson = this.lessons[0];
      this.activeIndex = 0;

      this.loadCourseQuiz();
    });
  }

  selectLesson(lesson: any, index: number): void {
    if (index > this.nextAvailableIndex) {
      this.message = 'Termine la video precedente pour debloquer celle-ci.';
      return;
    }

    this.activeLesson = lesson;
    this.activeIndex = index;
    this.message = '';
  }

  completeLesson(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';

    if (!this.activeLesson) return;

    this.api.completeLesson(slug, this.activeLesson.id).subscribe({
      next: (result) => {
        this.completedLessonIds.add(this.activeLesson.id);
        this.saveCompletedLessons();

        this.message = `Progression enregistree: ${result.progress}%`;

        if (this.hasNextLesson) {
          this.selectLesson(this.lessons[this.activeIndex + 1], this.activeIndex + 1);
          return;
        }

        if (this.courseCompleted && this.quiz) {
          this.router.navigate(['/quiz', this.quiz.slug]);
        }
      },
      error: (err) => {
        this.message = err.error?.msg || 'Connecte-toi pour enregistrer ta progression.';
      }
    });
  }

  get hasNextLesson(): boolean {
    return this.activeIndex < this.lessons.length - 1;
  }

  get courseCompleted(): boolean {
    return this.lessons.length > 0 &&
      this.lessons.every((lesson) => this.completedLessonIds.has(lesson.id));
  }

  get nextAvailableIndex(): number {
    const firstIncomplete = this.lessons.findIndex(
      (lesson) => !this.completedLessonIds.has(lesson.id)
    );

    return firstIncomplete === -1 ? this.lessons.length - 1 : firstIncomplete;
  }

  get progressPercent(): number {
    return this.lessons.length
      ? Math.round((this.completedLessonIds.size / this.lessons.length) * 100)
      : 0;
  }

  isCompleted(lesson: any): boolean {
    return this.completedLessonIds.has(lesson.id);
  }

  isLocked(index: number): boolean {
    return index > this.nextAvailableIndex;
  }

  openQuiz(): void {
    if (!this.courseCompleted) {
      this.message = 'Termine toutes les videos avant de passer le quiz.';
      return;
    }

    this.router.navigate(this.quiz ? ['/quiz', this.quiz.slug] : ['/quiz']);
  }

  private withAngularVideos(lessons: any[]): any[] {
    if (!this.course?.title?.toLowerCase().includes('angular')) {
      return lessons;
    }

    return lessons.map((lesson, index) => ({
      ...lesson,
      ...(ANGULAR_VIDEOS[index] || {}),
      title: ANGULAR_VIDEOS[index]?.title || lesson.title,
      content: ANGULAR_VIDEOS[index]?.content || lesson.content,
      duration_minutes: ANGULAR_VIDEOS[index]?.duration_minutes || lesson.duration_minutes,
      video_url: ANGULAR_VIDEOS[index]?.video_url || lesson.video_url,
    }));
  }

  private loadCourseQuiz(): void {
    this.api.getQuizzes().subscribe((quizzes) => {
      this.quiz = quizzes.find((quiz: any) => quiz.course_title === this.course.title);
    });
  }

  private storageKey(): string {
    return `course-progress:${this.course?.slug || this.route.snapshot.paramMap.get('slug') || ''}`;
  }

  private loadCompletedLessons(): Set<number> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Set();
    }

    const raw = localStorage.getItem(this.storageKey());

    try {
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private saveCompletedLessons(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(
      this.storageKey(),
      JSON.stringify([...this.completedLessonIds])
    );
  }
}
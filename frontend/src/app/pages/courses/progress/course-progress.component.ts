import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-course-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-progress.component.html',
  styleUrl: './course-progress.component.scss'
})
export class CourseProgressComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  course: any;
  progressCourse: any;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getCourse(slug).subscribe((course) => this.course = course);
    this.api.getStudentCourses().subscribe((courses) => {
      this.progressCourse = courses.find((course) => course.slug === slug);
    });
  }

  get progress(): number {
    return Number(this.progressCourse?.progress || 0);
  }
}

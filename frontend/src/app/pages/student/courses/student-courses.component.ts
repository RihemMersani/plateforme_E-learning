import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss'
})
export class StudentCoursesComponent implements OnInit {
  private api = inject(ApiService);
  courses: any[] = [];

  ngOnInit(): void {
    this.api.getStudentCourses().subscribe((courses) => this.courses = courses);
  }
}

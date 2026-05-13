import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress.component.html',
  styleUrl: './student-progress.component.scss'
})
export class StudentProgressComponent implements OnInit {
  private api = inject(ApiService);
  courses: any[] = [];

  ngOnInit(): void {
    this.api.getStudentCourses().subscribe((courses) => this.courses = courses);
  }
}

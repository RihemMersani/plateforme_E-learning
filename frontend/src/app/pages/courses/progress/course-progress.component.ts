import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-course-progress',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './course-progress.component.html',
  styleUrl: './course-progress.component.scss'
})
export class CourseProgressComponent {}

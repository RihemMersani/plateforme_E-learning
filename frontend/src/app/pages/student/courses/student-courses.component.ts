import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss'
})
export class StudentCoursesComponent {}

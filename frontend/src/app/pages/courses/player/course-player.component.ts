import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.scss'
})
export class CoursePlayerComponent {}

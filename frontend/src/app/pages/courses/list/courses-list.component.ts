import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent {}

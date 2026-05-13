import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent implements OnInit {
  private api = inject(ApiService);
  courses: any[] = [];
  search = '';
  level = 'Tous';
  loading = true;

  ngOnInit(): void {
    this.api.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredCourses(): any[] {
    const term = this.search.trim().toLowerCase();
    return this.courses.filter((course) => {
      const matchesSearch = !term || course.title.toLowerCase().includes(term) || course.description?.toLowerCase().includes(term);
      const matchesLevel = this.level === 'Tous' || course.level === this.level;
      return matchesSearch && matchesLevel;
    });
  }
}

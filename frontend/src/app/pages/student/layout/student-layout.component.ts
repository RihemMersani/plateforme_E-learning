import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthLocalService } from '../../../shared/auth-local.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.scss'
})
export class StudentLayoutComponent implements OnInit {
  private auth = inject(AuthLocalService);
  private router = inject(Router);
  user: any;

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe({
      next: (user) => this.user = user,
      error: () => this.logout()
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

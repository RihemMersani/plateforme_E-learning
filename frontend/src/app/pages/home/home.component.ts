import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthLocalService } from '../../shared/auth-local.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private auth = inject(AuthLocalService);

  isStudent(): boolean {
    return this.auth.isStudentLoggedIn();
  }
}

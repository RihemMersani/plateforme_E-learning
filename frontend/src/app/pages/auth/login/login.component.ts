import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthLocalService } from '../../../shared/auth-local.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthLocalService);
  private router = inject(Router);

  onLogin(event: Event): void {
    event.preventDefault();
    this.auth.loginAsStudent();
    void this.router.navigate(['/etudiant']);
  }
}

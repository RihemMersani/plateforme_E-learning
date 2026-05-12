import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthLocalService } from '../../../shared/auth-local.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthLocalService);
  private router = inject(Router);

  onRegister(event: Event, role: string): void {
    event.preventDefault();

    if (role === 'Etudiant') {
      this.auth.loginAsStudent();
      void this.router.navigate(['/etudiant']);
      return;
    }

    void this.router.navigate(['/login']);
  }
}

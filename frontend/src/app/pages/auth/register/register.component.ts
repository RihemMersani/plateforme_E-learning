import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthLocalService } from '../../../shared/auth-local.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

// Custom validator to check if passwords match
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const passwordConfirm = control.get('passwordConfirm');

  if (password && passwordConfirm && password.value !== passwordConfirm.value) {
    return { passwordsMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthLocalService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  errorMessage = '';

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', Validators.required]
  }, { validators: passwordsMatchValidator });

  onRegister(): void {
    this.errorMessage = '';

    if (this.registerForm.valid) {
      const { firstName, lastName, email, password } = this.registerForm.value;
      // @ts-ignore
      this.auth.register({ firstName, lastName, email, password }).subscribe({
        next: () => this.router.navigate(['/etudiant']),
        error: (err: any) => {
          this.errorMessage = err.error?.msg || 'Inscription impossible pour le moment.';
          console.error('Registration failed', err);
        }
      });
    }
  }
}

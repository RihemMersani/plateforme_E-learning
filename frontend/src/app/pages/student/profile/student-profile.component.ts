import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthLocalService } from '../../../shared/auth-local.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss'
})
export class StudentProfileComponent implements OnInit {
  private auth = inject(AuthLocalService);
  profile: any = {};
  password = '';
  message = '';

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe((profile) => this.profile = profile);
  }

  save(): void {
    this.auth.updateProfile({
      fullName: this.profile.full_name,
      email: this.profile.email,
      password: this.password || undefined
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.password = '';
        this.message = 'Profil mis a jour.';
      },
      error: (err) => this.message = err.error?.msg || 'Mise a jour impossible.'
    });
  }
}

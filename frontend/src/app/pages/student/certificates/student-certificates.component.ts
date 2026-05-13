import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-certificates.component.html',
  styleUrl: './student-certificates.component.scss'
})
export class StudentCertificatesComponent implements OnInit {
  private api = inject(ApiService);
  certificates: any[] = [];

  ngOnInit(): void {
    this.api.getStudentCertificates().subscribe((certificates) => this.certificates = certificates);
  }
}

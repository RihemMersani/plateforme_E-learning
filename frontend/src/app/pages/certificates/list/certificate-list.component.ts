import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss'
})
export class CertificateListComponent implements OnInit {
  private api = inject(ApiService);
  earned: any[] = [];
  inProgress: any[] = [];
  message = '';

  ngOnInit(): void {
    this.api.getCertificates().subscribe({
      next: (data) => {
        this.earned = data.earned;
        this.inProgress = data.inProgress;
      },
      error: (err) => this.message = err.error?.msg || 'Connecte-toi pour voir tes certificats.'
    });
  }
}

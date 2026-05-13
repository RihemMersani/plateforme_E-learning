import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../shared/api.service';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificate-detail.component.html',
  styleUrl: './certificate-detail.component.scss'
})
export class CertificateDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  certificate: any;
  message = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getCertificate(slug).subscribe({
      next: (certificate) => this.certificate = certificate,
      error: (err) => this.message = err.error?.msg || 'Certificat indisponible.'
    });
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './certificate-detail.component.html',
  styleUrl: './certificate-detail.component.scss'
})
export class CertificateDetailComponent {}

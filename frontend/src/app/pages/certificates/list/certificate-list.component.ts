import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss'
})
export class CertificateListComponent {}

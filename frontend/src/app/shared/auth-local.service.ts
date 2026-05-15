import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthLocalService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:5000/api/auth';

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((res: any) => this.setToken(res.token))
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => this.setToken(res.token))
    );
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem(TOKEN_KEY);
  }

  getCurrentUser(): Observable<any> {
    if (!this.isBrowser()) return of(null);

    return this.http.get(`${this.apiUrl}/me`, {
      headers: this.authHeaders()
    });
  }

  updateProfile(profile: any): Observable<any> {
    if (!this.isBrowser()) return of(null);

    return this.http.put(`${this.apiUrl}/me`, profile, {
      headers: this.authHeaders()
    });
  }

  isStudentLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(TOKEN_KEY, token);
  }

  private getToken(): string | null {
    if (!this.isBrowser()) return null;

    return localStorage.getItem(TOKEN_KEY);
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

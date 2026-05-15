import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

const API_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/courses`);
  }

  getCourse(slug: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/courses/${slug}`);
  }

  enroll(slug: string): Observable<any> {
    return this.http.post(`${API_URL}/courses/${slug}/enroll`, {}, { headers: this.authHeaders() });
  }

  completeLesson(slug: string, lessonId: number): Observable<any> {
    return this.http.post(`${API_URL}/courses/${slug}/lessons/${lessonId}/complete`, {}, { headers: this.authHeaders() });
  }

  getQuizzes(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/quizzes`);
  }

  getQuiz(slug: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/quizzes/${slug}`);
  }

  submitQuiz(slug: string, answers: Record<number, number>): Observable<any> {
    return this.http.post(`${API_URL}/quizzes/${slug}/submit`, { answers }, { headers: this.authHeaders() });
  }

  getQuizResult(slug: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/quizzes/${slug}/result`, { headers: this.authHeaders() });
  }

  getDashboard(): Observable<any> {
    if (!this.isBrowser()) {
      return of({ summary: {}, courses: [], quizzes: [] });
    }

    return this.http.get<any>(`${API_URL}/student/dashboard`, { headers: this.authHeaders() });
  }

  getStudentCourses(): Observable<any[]> {
    if (!this.isBrowser()) return of([]);

    return this.http.get<any[]>(`${API_URL}/student/courses`, { headers: this.authHeaders() });
  }

  getStudentQuizzes(): Observable<any[]> {
    if (!this.isBrowser()) return of([]);

    return this.http.get<any[]>(`${API_URL}/student/quizzes`, { headers: this.authHeaders() });
  }

  getStudentCertificates(): Observable<any[]> {
    if (!this.isBrowser()) return of([]);

    return this.http.get<any[]>(`${API_URL}/student/certificates`, { headers: this.authHeaders() });
  }

  getCertificates(): Observable<any> {
    if (!this.isBrowser()) return of({ earned: [], inProgress: [] });

    return this.http.get<any>(`${API_URL}/certificates`, { headers: this.authHeaders() });
  }

  getCertificate(slug: string): Observable<any> {
    if (!this.isBrowser()) return of(null);

    return this.http.get<any>(`${API_URL}/certificates/${slug}`, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    if (!this.isBrowser()) return new HttpHeaders();

    const token = localStorage.getItem(TOKEN_KEY);
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

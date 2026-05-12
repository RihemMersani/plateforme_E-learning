import { Injectable } from '@angular/core';

const STUDENT_KEY = 'studentLoggedIn';

@Injectable({
  providedIn: 'root'
})
export class AuthLocalService {
  isStudentLoggedIn(): boolean {
    return localStorage.getItem(STUDENT_KEY) === 'true';
  }

  loginAsStudent(): void {
    localStorage.setItem(STUDENT_KEY, 'true');
  }

  logout(): void {
    localStorage.removeItem(STUDENT_KEY);
  }
}

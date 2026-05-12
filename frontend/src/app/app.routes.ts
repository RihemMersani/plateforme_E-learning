import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { CoursesListComponent } from './pages/courses/list/courses-list.component';
import { CourseDetailComponent } from './pages/courses/detail/course-detail.component';
import { CoursePlayerComponent } from './pages/courses/player/course-player.component';
import { CourseProgressComponent } from './pages/courses/progress/course-progress.component';
import { QuizListComponent } from './pages/quiz/list/quiz-list.component';
import { QuizTakeComponent } from './pages/quiz/take/quiz-take.component';
import { QuizResultComponent } from './pages/quiz/result/quiz-result.component';
import { CertificateListComponent } from './pages/certificates/list/certificate-list.component';
import { CertificateDetailComponent } from './pages/certificates/detail/certificate-detail.component';
import { StudentLayoutComponent } from './pages/student/layout/student-layout.component';
import { StudentDashboardComponent } from './pages/student/dashboard/student-dashboard.component';
import { StudentCoursesComponent } from './pages/student/courses/student-courses.component';
import { StudentProgressComponent } from './pages/student/progress/student-progress.component';
import { StudentQuizzesComponent } from './pages/student/quizzes/student-quizzes.component';
import { StudentCertificatesComponent } from './pages/student/certificates/student-certificates.component';
import { StudentProfileComponent } from './pages/student/profile/student-profile.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'cours', component: CoursesListComponent },
	{ path: 'cours/:slug', component: CourseDetailComponent },
	{ path: 'cours/:slug/lecture', component: CoursePlayerComponent },
	{ path: 'cours/:slug/progression', component: CourseProgressComponent },
	{ path: 'quiz', component: QuizListComponent },
	{ path: 'quiz/:slug', component: QuizTakeComponent },
	{ path: 'quiz/:slug/resultat', component: QuizResultComponent },
	{ path: 'certificats', component: CertificateListComponent },
	{ path: 'certificats/:slug', component: CertificateDetailComponent },
	{
		path: 'etudiant',
		component: StudentLayoutComponent,
		children: [
			{ path: '', component: StudentDashboardComponent },
			{ path: 'mes-cours', component: StudentCoursesComponent },
			{ path: 'progres', component: StudentProgressComponent },
			{ path: 'quiz', component: StudentQuizzesComponent },
			{ path: 'certificats', component: StudentCertificatesComponent },
			{ path: 'profil', component: StudentProfileComponent }
		]
	},
	{ path: 'login', component: LoginComponent },
	{ path: 'inscription', component: RegisterComponent },
	{ path: '**', redirectTo: '' }
];

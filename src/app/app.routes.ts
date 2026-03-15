import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { JobsList } from './components/jobs-list/jobs-list';
import { JobDetails } from './components/job-details/job-details';
import { CreateJob } from './components/create-job/create-job';
import { MyJobs } from './components/my-jobs/my-jobs';
import { MyProposals } from './components/my-proposals/my-proposals';
import { SubmitReview } from './components/submit-review/submit-review';
import { UserProfile } from './components/user-profile/user-profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'jobs', component: JobsList, canActivate: [authGuard] },
  { path: 'jobs/create', component: CreateJob, canActivate: [authGuard] },
  { path: 'jobs/:id', component: JobDetails, canActivate: [authGuard] },
  { path: 'my-jobs', component: MyJobs, canActivate: [authGuard] },
  { path: 'my-proposals', component: MyProposals, canActivate: [authGuard] },
  { path: 'review/:jobId', component: SubmitReview, canActivate: [authGuard] },
  { path: 'profile/:userId', component: UserProfile, canActivate: [authGuard] }
];

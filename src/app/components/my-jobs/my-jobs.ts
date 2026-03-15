import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-jobs',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-jobs.html',
  styleUrl: './my-jobs.scss'
})
export class MyJobs implements OnInit {
  
  jobs: any[] = [];
  loading = false;
  errorMessage = '';
  currentUser: any = null;

  constructor(
    private readonly jobsService: JobsService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMyJobs();
  }

  loadMyJobs() {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.jobsService.getMyJobs().subscribe({
      next: (jobs) => {
        console.log('My jobs loaded:', jobs);
        this.jobs = Array.isArray(jobs) ? jobs : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load my jobs:', err);
        this.errorMessage = 'Failed to load your jobs. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewJob(jobId: string) {
    this.router.navigate(['/jobs', jobId]);
  }

  createNewJob() {
    this.router.navigate(['/jobs/create']);
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-jobs-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs-list.html',
  styleUrl: './jobs-list.scss'
})
export class JobsList implements OnInit {
  
  jobs: any[] = [];
  loading = false;
  errorMessage = '';
  currentUser: any = null;

  filters = {
    category: '',
    status: 'open',
    min_budget: ''
  };

  categories = ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Other'];

  constructor(
    private readonly jobsService: JobsService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.searchJobs();
  }

  searchJobs() {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const searchFilters: any = {
      status: this.filters.status
    };

    if (this.filters.category) {
      searchFilters.category = this.filters.category;
    }

    if (this.filters.min_budget) {
      searchFilters.min_budget = parseFloat(this.filters.min_budget);
    }

    this.jobsService.searchJobs(searchFilters).subscribe({
      next: (jobs) => {
        console.log('Jobs loaded:', jobs);
        this.jobs = Array.isArray(jobs) ? jobs : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search error:', err);
        this.errorMessage = err.error?.error || 'Failed to load jobs';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetFilters() {
    this.filters = {
      category: '',
      status: 'open',
      min_budget: ''
    };
    this.searchJobs();
  }

  viewJob(jobId: string) {
    this.router.navigate(['/jobs', jobId]);
  }
}

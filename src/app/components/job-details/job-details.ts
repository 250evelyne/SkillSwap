import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './job-details.html',
  styleUrl: './job-details.scss'
})
export class JobDetails implements OnInit {
  
  job: any = null;
  proposals: any[] = [];
  currentUser: any = null;
  loading = true;
  errorMessage = '';
  hasApplied = false;

  showProposalForm = false;
  proposalForm = {
    price: '',
    cover_letter: ''
  };
  submittingProposal = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly jobsService: JobsService,
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    const jobId = this.route.snapshot.paramMap.get('id');
    
    console.log('Loading job with ID:', jobId);
    
    if (jobId) {
      this.loadJobDetails(jobId);
      this.checkIfApplied();
    } else {
      this.errorMessage = 'No job ID provided';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadJobDetails(jobId: string) {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    console.log('Fetching job details for:', jobId);
    
    this.jobsService.getJobById(jobId)
      .pipe(
        timeout(10000),
        catchError(err => {
          console.error('Job details error:', err);
          if (err.name === 'TimeoutError') {
            this.errorMessage = ' Request timed out. Please try again.';
          } else if (err.status === 404) {
            this.errorMessage = ' Job not found.';
          } else if (err.status === 401) {
            this.errorMessage = ' Please login to view this job.';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          } else {
            this.errorMessage = ' Failed to load job: ' + (err.error?.error || err.message);
          }
          this.loading = false;
          this.cdr.detectChanges();
          return of(null);
        })
      )
      .subscribe({
        next: (job) => {
          console.log('Job loaded:', job);
          if (job) {
            this.job = job;
            
            if (this.isOwner()) {
              this.loadProposals(jobId);
            }
          }
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadProposals(jobId: string) {
    console.log('Loading proposals for job:', jobId);
    
    this.jobsService.getJobProposals(jobId).subscribe({
      next: (proposals) => {
        console.log('=== RAW PROPOSALS DATA ===');
        console.log('Full proposals array:', proposals);
        
        if (proposals && proposals.length > 0) {
          console.log('First proposal structure:', proposals[0]);
          console.log('First proposal keys:', Object.keys(proposals[0]));
          console.log('freelancer_id:', proposals[0].freelancer_id);
          console.log('freelancer object:', proposals[0].freelancer);
        }
        
        this.proposals = Array.isArray(proposals) ? proposals : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load proposals:', err);
      }
    });
  }

  checkIfApplied() {
    this.jobsService.getMyProposals().subscribe({
      next: (proposals: any[]) => {
        const jobId = this.route.snapshot.paramMap.get('id');
        this.hasApplied = proposals.some(p => p.job?.id === jobId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to check proposals:', err);
      }
    });
  }

  isOwner(): boolean {
    return this.currentUser?.id === this.job?.owner?.id;
  }

  canSubmitProposal(): boolean {
    return !this.isOwner() && this.job?.status === 'open' && !this.hasApplied;
  }

  submitProposal() {
    if (!this.proposalForm.price || !this.proposalForm.cover_letter.trim()) {
      alert(' Please fill in all fields!');
      return;
    }

    const price = parseFloat(String(this.proposalForm.price));
    if (isNaN(price) || price <= 0) {
      alert(' Please enter a valid price!');
      return;
    }

    this.submittingProposal = true;

    this.jobsService.submitProposal(
      this.job.id,
      price,
      this.proposalForm.cover_letter
    ).subscribe({
      next: (response) => {
        console.log('Proposal submitted:', response);
        this.submittingProposal = false;
        alert(' Proposal submitted successfully!');
        this.showProposalForm = false;
        this.proposalForm = { price: '', cover_letter: '' };
        this.router.navigate(['/my-proposals']);
      },
      error: (err) => {
        console.error('Proposal error:', err);
        this.submittingProposal = false;
        
        if (err.error?.error) {
          alert(' ' + err.error.error);
        } else {
          alert(' Failed to submit proposal.');
        }
      }
    });
  }

  viewProfile(userId: string) {
    if (userId) {
      this.router.navigate(['/profile', userId]);
    } else {
      alert(' User profile not available');
    }
  }

  acceptProposal(proposalId: string) {
    if (!confirm('Are you sure you want to accept this proposal?')) {
      return;
    }

    this.jobsService.acceptProposal(proposalId).subscribe({
      next: (response) => {
        console.log('Proposal accepted:', response);
        alert(' Proposal accepted! Job is now in progress.');
        this.loadJobDetails(this.job.id);
      },
      error: (err) => {
        console.error('Accept proposal error:', err);
        if (err.error?.error) {
          alert(' ' + err.error.error);
        } else {
          alert(' Failed to accept proposal.');
        }
      }
    });
  }

  completeJob() {
    if (!confirm('Mark this job as completed?')) {
      return;
    }

    this.jobsService.completeJob(this.job.id).subscribe({
      next: (response) => {
        console.log('Job completed:', response);
        alert(' Job marked as completed!');
        this.loadJobDetails(this.job.id);
      },
      error: (err) => {
        console.error('Complete job error:', err);
        if (err.error?.error) {
          alert(' ' + err.error.error);
        } else {
          alert(' Failed to complete job.');
        }
      }
    });
  }

  navigateToReview() {
    this.router.navigate(['/review', this.job.id]);
  }

  goBack() {
    this.router.navigate(['/jobs']);
  }
}

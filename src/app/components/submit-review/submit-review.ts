import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../services/auth.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-submit-review',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './submit-review.html',
  styleUrl: './submit-review.scss'
})
export class SubmitReview implements OnInit {
  
  jobId: string = '';
  job: any = null;
  targetUser: any = null;
  currentUser: any = null;
  loading = true;
  submitting = false;

  reviewForm = {
    rating: 5,
    comment: ''
  };

  stars = [1, 2, 3, 4, 5];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly jobsService: JobsService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.jobId = this.route.snapshot.paramMap.get('jobId') || '';
    
    console.log('Loading review page for job:', this.jobId);
    console.log('Current user:', this.currentUser);
    
    if (this.jobId) {
      this.loadJobDetails();
    } else {
      alert('❌ Invalid job ID');
      this.router.navigate(['/dashboard']);
    }
  }

  loadJobDetails() {
    this.loading = true;
    this.cdr.detectChanges();

    console.log('Fetching job details for review:', this.jobId);

    this.jobsService.getJobById(this.jobId)
      .pipe(
        timeout(10000),
        catchError(err => {
          console.error('Failed to load job:', err);
          alert('❌ Failed to load job details');
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/dashboard']);
          return of(null);
        })
      )
      .subscribe({
        next: (job) => {
          console.log('Job loaded for review:', job);
          
          if (!job) {
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          this.job = job;
          
          // Determine who to review
          if (this.currentUser?.id === job.owner?.id) {
            // I'm the owner, review the freelancer
            this.targetUser = job.freelancer;
          } else {
            // I'm the freelancer, review the owner
            this.targetUser = job.owner;
          }

          console.log('Target user to review:', this.targetUser);

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Unexpected error loading job:', err);
          alert('❌ Failed to load job details');
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/dashboard']);
        }
      });
  }

  setRating(rating: number) {
    this.reviewForm.rating = rating;
    this.cdr.detectChanges();
  }

  submitReview() {
    if (!this.reviewForm.comment.trim()) {
      alert('❌ Please write a comment for your review!');
      return;
    }

    if (!this.targetUser || !this.targetUser.id) {
      alert('❌ Invalid target user for review');
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    console.log('Submitting review:', {
      jobId: this.jobId,
      targetId: this.targetUser.id,
      rating: this.reviewForm.rating,
      comment: this.reviewForm.comment
    });

    this.jobsService.submitReview(
      this.jobId,
      this.targetUser.id,
      this.reviewForm.rating,
      this.reviewForm.comment
    ).subscribe({
      next: (response) => {
        console.log('Review submitted:', response);
        this.submitting = false;
        this.cdr.detectChanges();
        alert('✅ Review submitted successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Review submission error:', err);
        this.submitting = false;
        this.cdr.detectChanges();
        
        if (err.error?.error) {
          alert('❌ ' + err.error.error);
        } else {
          alert('❌ Failed to submit review. Please try again.');
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}

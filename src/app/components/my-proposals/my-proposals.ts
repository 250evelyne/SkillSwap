import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-proposals',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-proposals.html',
  styleUrl: './my-proposals.scss'
})
export class MyProposals implements OnInit {
  
  proposals: any[] = [];
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
    this.loadMyProposals();
  }

  loadMyProposals() {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.jobsService.getMyProposals().subscribe({
      next: (proposals) => {
        console.log('=== MY PROPOSALS DEBUG ===');
        console.log('Raw proposals:', proposals);
        if (proposals && proposals.length > 0) {
          console.log('First proposal:', proposals[0]);
          console.log('First proposal job object:', proposals[0].job);
          console.log('First proposal job status:', proposals[0].job?.status);
        }
        
        this.proposals = Array.isArray(proposals) ? proposals : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load my proposals:', err);
        this.errorMessage = 'Failed to load your proposals. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  canLeaveReview(proposal: any): boolean {
    // Check if proposal is accepted
    if (proposal.status !== 'accepted') {
      return false;
    }
    
    // Check job status
    const jobStatus = proposal.job?.status;
    console.log(`Proposal ${proposal.id} - job status:`, jobStatus);
    
    return jobStatus === 'completed';
  }

  viewJob(jobId: string) {
    this.router.navigate(['/jobs', jobId]);
  }

  leaveReview(jobId: string) {
    this.router.navigate(['/review', jobId]);
  }

  withdrawProposal(proposalId: string) {
    if (!confirm('Are you sure you want to withdraw this proposal?')) {
      return;
    }

    this.jobsService.deleteProposal(proposalId).subscribe({
      next: () => {
        alert('✅ Proposal withdrawn successfully!');
        this.loadMyProposals();
      },
      error: (err) => {
        console.error('Withdraw error:', err);
        if (err.error?.error) {
          alert('❌ ' + err.error.error);
        } else {
          alert('❌ Failed to withdraw proposal.');
        }
      }
    });
  }
}

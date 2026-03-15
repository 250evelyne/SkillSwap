import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  
  private readonly API_URL = 'https://stingray-app-wxhhn.ondigitalocean.app';

  constructor(private readonly http: HttpClient) {}

  // Search jobs with filters
  searchJobs(filters: any = {}): Observable<any> {
    return this.http.post(`${this.API_URL}/jobs/search`, filters);
  }

  // Get job by ID
  getJobById(jobId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/jobs/${jobId}`);
  }

  // Create new job
  createJob(title: string, description: string, budget: number, category: string): Observable<any> {
    return this.http.post(`${this.API_URL}/jobs`, {
      title,
      description,
      budget,
      category
    });
  }

  // Update job
  updateJob(jobId: string, updates: any): Observable<any> {
    return this.http.patch(`${this.API_URL}/jobs/${jobId}`, updates);
  }

  // Get my posted jobs
  getMyJobs(): Observable<any> {
    return this.http.get(`${this.API_URL}/jobs/my-postings`);
  }

  // Complete a job
  completeJob(jobId: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/jobs/${jobId}/complete`, {});
  }

  // Submit proposal
  submitProposal(jobId: string, price: number, coverLetter: string): Observable<any> {
    return this.http.post(`${this.API_URL}/jobs/${jobId}/proposals`, {
      price,
      cover_letter: coverLetter
    });
  }

  // Get proposals for a job (owner only)
  getJobProposals(jobId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/jobs/${jobId}/proposals`);
  }

  // Accept a proposal
  acceptProposal(proposalId: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/proposals/${proposalId}/accept`, {});
  }

  // Get my proposals
  getMyProposals(): Observable<any> {
    return this.http.get(`${this.API_URL}/proposals/my-bids`);
  }

  // Delete/withdraw proposal
  deleteProposal(proposalId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/proposals/${proposalId}`);
  }

  // Submit review
  submitReview(jobId: string, targetId: number, rating: number, comment: string = ''): Observable<any> {
    return this.http.post(`${this.API_URL}/jobs/${jobId}/reviews`, {
      target_id: targetId,
      rating,
      comment
    });
  }

  // Get user reviews
  getUserReviews(userId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/reviews/user/${userId}`);
  }
}

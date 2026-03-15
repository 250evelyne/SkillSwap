import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit {
  
  userId: string = '';
  user: any = null;
  reviews: any[] = [];
  loading = true;
  errorMessage = '';
  isOwnProfile = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly jobsService: JobsService,
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    const currentUser = this.authService.getCurrentUser();
    
    console.log('Loading profile for user ID:', this.userId);
    console.log('Current user:', currentUser);
    
    if (!this.userId) {
      this.errorMessage = 'Invalid user ID';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // Check if this is own profile
    if (currentUser && currentUser.id === this.userId) {
      this.isOwnProfile = true;
      this.user = currentUser;
      this.loading = false;
      this.cdr.detectChanges();
      console.log('Showing own profile from localStorage');
    } else {
      // Try to fetch other user's profile from API
      this.loadUserProfile();
    }

    // Always try to load reviews
    this.loadUserReviews();
  }

  loadUserProfile() {
    this.loading = true;
    this.cdr.detectChanges();

    console.log('Attempting to fetch user profile from API for ID:', this.userId);

    // Try fetching with user ID first
    this.http.get(`https://stingray-app-wxhhn.ondigitalocean.app/users/${this.userId}`).subscribe({
      next: (user: any) => {
        console.log('User profile loaded from API:', user);
        this.user = user;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user profile with ID:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error);
        
        // The API might expect username instead of ID
        // For now, show a helpful error message
        this.errorMessage = 'Unable to load this user profile. The API may require a username instead of user ID.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUserReviews() {
    console.log('Fetching reviews for user:', this.userId);
    
    this.http.get(`https://stingray-app-wxhhn.ondigitalocean.app/reviews/user/${this.userId}`).subscribe({
      next: (reviews: any) => {
        console.log('User reviews loaded:', reviews);
        this.reviews = Array.isArray(reviews) ? reviews : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.reviews = [];
        this.cdr.detectChanges();
      }
    });
  }

  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '⭐' : '☆');
    }
    return stars;
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

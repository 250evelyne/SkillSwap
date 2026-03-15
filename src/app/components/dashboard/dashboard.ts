import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  
  currentUser: any = null;
  stats = {
    total_users: 0,
    active_jobs: 0,
    total_value_moved: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('CURRENT USER:', this.currentUser);
    
    setTimeout(() => {
      this.loadStats();
    }, 0);
  }

  loadStats() {
    console.log('Loading platform stats...');
    
    this.http.get<any>('https://stingray-app-wxhhn.ondigitalocean.app/platform/stats').subscribe({
      next: (data) => {
        console.log('Platform stats received:', data);
        
        setTimeout(() => {
          this.stats = {
            total_users: data.total_users || 0,
            active_jobs: data.active_jobs || 0,
            total_value_moved: data.total_value_moved || 0
          };
          console.log('Stats updated:', this.stats);
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  formatValue(value: number): string {
    if (value >= 1e12) {
      return (value / 1e12).toFixed(1) + 'T';
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toString();
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
      alert(' Logged out successfully!');
    }
  }
}

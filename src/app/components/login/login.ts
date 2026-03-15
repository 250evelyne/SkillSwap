import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  
  form = {
    email: '',
    password: ''
  };

  errorMessage = '';
  submitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit() {
    this.errorMessage = '';

    if (!this.form.email.trim()) {
      alert('❌ Email is required!');
      return;
    }

    if (!this.form.password.trim()) {
      alert('❌ Password is required!');
      return;
    }

    this.submitting = true;

    this.authService.login(this.form.email, this.form.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.submitting = false;
        alert('✅ Login successful! Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.submitting = false;
        
        if (err.error?.error) {
          this.errorMessage = err.error.error;
          alert('❌ ' + err.error.error);
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid credentials';
          alert('❌ Invalid email or password!');
        } else {
          this.errorMessage = 'Login failed. Please try again.';
          alert('❌ Login failed. Please try again.');
        }
      }
    });
  }
}

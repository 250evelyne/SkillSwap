import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  
  form = {
    name: '',
    username: '',
    email: '',
    password: '',
    bio: '',
    skills: ''
  };

  errorMessage = '';
  submitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit() {
    this.errorMessage = '';

    if (!this.form.name.trim()) {
      alert('Name is required!');
      return;
    }

    if (!this.form.username.trim()) {
      alert('Username is required!');
      return;
    }

    if (!this.form.email.trim()) {
      alert('Email is required!');
      return;
    }

    if (!this.form.password.trim()) {
      alert('Password is required!');
      return;
    }

    if (!this.form.bio.trim()) {
      alert('Bio is required!');
      return;
    }

    if (!this.form.skills.trim()) {
      alert('Skills are required!');
      return;
    }

    this.submitting = true;

    const skillsArray = this.form.skills.split(',').map(s => s.trim()).filter(s => s);

    this.authService.register(
      this.form.name,
      this.form.username,
      this.form.email,
      this.form.password,
      this.form.bio,
      skillsArray
    ).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.submitting = false;
        alert(' Account created successfully! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.submitting = false;
        
        if (err.error?.error) {
          this.errorMessage = err.error.error;
          alert('' + err.error.error);
          
          if (err.error.suggested_username) {
            alert(' Suggested username: ' + err.error.suggested_username);
          }
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
          alert('Registration failed. Please try again.');
        }
      }
    });
  }
}

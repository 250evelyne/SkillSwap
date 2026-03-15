import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobsService } from '../../services/jobs.service';

@Component({
  selector: 'app-create-job',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-job.html',
  styleUrl: './create-job.scss'
})
export class CreateJob {
  
  form = {
    title: '',
    description: '',
    budget: '',
    category: ''
  };

  errorMessage = '';
  submitting = false;

  categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Other'
  ];

  constructor(
    private readonly jobsService: JobsService,
    private readonly router: Router
  ) {
    console.log('CreateJob component initialized');
  }

  submit() {
    console.log('Submit clicked!', this.form);
    this.errorMessage = '';

    if (!this.form.title.trim()) {
      alert(' Job title is required!');
      return;
    }

    if (!this.form.description.trim()) {
      alert(' Job description is required!');
      return;
    }

    if (!this.form.budget || this.form.budget === '') {
      alert(' Budget is required!');
      return;
    }

    const budget = parseFloat(String(this.form.budget));
    if (isNaN(budget) || budget <= 0) {
      alert(' Please enter a valid budget amount!');
      return;
    }

    if (!this.form.category) {
      alert(' Please select a category!');
      return;
    }

    this.submitting = true;
    console.log('Creating job...', { title: this.form.title, budget });

    this.jobsService.createJob(
      this.form.title,
      this.form.description,
      budget,
      this.form.category
    ).subscribe({
      next: (response) => {
        console.log('Job created:', response);
        this.submitting = false;
        alert('Job posted successfully!');
       
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        console.error('Create job error:', err);
        this.submitting = false;
        
        if (err.error?.error) {
          this.errorMessage = err.error.error;
          alert(' ' + err.error.error);
        } else {
          this.errorMessage = 'Failed to create job. Please try again.';
          alert(' Failed to create job. Please try again.');
        }
      }
    });
  }

  cancel() {
    if (confirm('Are you sure? Your changes will be lost.')) {
      this.router.navigate(['/dashboard']);
    }
  }
}

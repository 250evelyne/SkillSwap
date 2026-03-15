import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  

  const token = localStorage.getItem('token');
  
 
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Handle response 
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
        alert('⚠️ Session expired. Please login again.');
      }
      return throwError(() => error);
    })
  );
};
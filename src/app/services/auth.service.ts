import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly API_URL = 'https://stingray-app-wxhhn.ondigitalocean.app';
  private platformId = inject(PLATFORM_ID);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    // Initialize token only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.tokenSubject.next(this.getToken());
    }
  }

  register(name: string, username: string, email: string, password: string, bio: string, skills: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, {
      name,
      username,
      email,
      password,
      bio,
      skills
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.token && isPlatformBrowser(this.platformId)) {
          this.setToken(response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.tokenSubject.next(null);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      this.tokenSubject.next(token);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private apiUrl = 'http://localhost:8000/auth'; // Ensure correct API base URL

  constructor(private http: HttpClient, private router: Router) {}

  // Login function
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { username, password }).pipe(
      tap((response: any) => {
        console.log('Login Response:', response);

        // Check if the response contains both tokens
        if (response?.access && response?.refresh) {
          // Store access and refresh tokens in localStorage
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);

          // Optionally, store the user details if available
          if (response?.user) {
            localStorage.setItem('user_details', JSON.stringify(response.user));
          }

          console.log('Login successful, navigating to home...');
          this.router.navigate(['/home']);  // Navigate to the home page after successful login
        } else {
          console.error('Missing tokens or user details in the response');
        }
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Invalid username or password'));
      })
    );
  }

  // Register function (sign-up)
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData).pipe(
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }

  // Logout function
  logout() {
    // Remove tokens and user details from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_details');
    
    console.log('User logged out, navigating to login page');
    this.router.navigate(['/login']);  // Navigate to login page after logging out
  }

  // Check if the user is logged in by verifying if the access token exists
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get the stored access token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Refresh the access token using the refresh token
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.http.post(`${this.apiUrl}/refresh/`, { refresh: refreshToken }).pipe(
      tap((response: any) => {
        if (response?.access) {
          // Update the access token in localStorage
          localStorage.setItem('access_token', response.access);
        }
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.logout(); // Logout user if token refresh fails
        return throwError(() => new Error('Session expired. Please log in again.'));
      })
    );
  }
}

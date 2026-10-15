import { Injectable, signal, computed, inject } from '@angular/core';
import { Apiservice } from './apiservice';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(Apiservice);

  // Signal for reactive state management across Angular components
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('instamart_token'));

  // Computed signal checking if the active user has admin privileges
  isAdmin = computed(() => {
    const user = this.currentUser();
    return !!user && (user.role === 'admin' || user.email === 'admin@instamart.com');
  });

  constructor() {}

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('instamart_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.loginUser(credentials).pipe(
      tap((res) => {
        if (res && res.user) {
          this.setUserSession(res.user, res.token);
        }
      }),
      catchError((err) => {
        const errorMsg = err?.error?.message || err?.message || 'Login failed. Please check your credentials.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  register(userData: { name: string; email: string; password: string; phone?: string; address?: string }): Observable<any> {
    return this.apiService.registerUser(userData).pipe(
      tap((res) => {
        if (res && res.user) {
          this.setUserSession(res.user, res.token);
        }
      }),
      catchError((err) => {
        const errorMsg = err?.error?.message || err?.message || 'Registration failed. Please try again.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('instamart_user');
    localStorage.removeItem('instamart_token');
    this.currentUser.set(null);
    this.token.set(null);
  }

  quickAdminLogin(): void {
    const adminUser: User = {
      id: 999,
      name: 'Store Administrator',
      email: 'admin@instamart.com',
      phone: '9998887770',
      address: 'Instamart HQ Operations Hub',
      role: 'admin'
    };
    this.setUserSession(adminUser, `admin-quick-${Date.now()}`);
  }

  private setUserSession(user: User, tokenStr: string): void {
    localStorage.setItem('instamart_user', JSON.stringify(user));
    if (tokenStr) {
      localStorage.setItem('instamart_token', tokenStr);
      this.token.set(tokenStr);
    }
    this.currentUser.set(user);
  }
}

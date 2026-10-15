import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  authService = inject(AuthService);
  router = inject(Router);

  username = signal<string>('');
  password = signal<string>('');
  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  fillAdminCredentials() {
    this.username.set('admin@instamart.com');
    this.password.set('admin123');
    this.errorMessage.set(null);
  }

  onSubmit() {
    const rawUser = this.username().trim();
    const rawPass = this.password().trim();

    if (!rawUser || !rawPass) {
      this.errorMessage.set('Please enter both Admin Username and Password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // Normalize username: if entered "admin", map to "admin@instamart.com"
    const emailToUse = rawUser.includes('@') ? rawUser.toLowerCase() : `${rawUser.toLowerCase()}@instamart.com`;

    this.authService.login({ email: emailToUse, password: rawPass }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          // If a non-admin user credentials was used, reject access to admin portal
          this.authService.logout();
          this.errorMessage.set('Access Denied: You do not have Administrator permissions.');
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Invalid administrator credentials. Please check and try again.');
      }
    });
  }
}

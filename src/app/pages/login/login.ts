import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  mode: 'login' | 'register' = 'login';

  // Form Fields
  email = '';
  password = '';
  name = '';
  phone = '';
  address = '';

  showPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  toggleMode(newMode: 'login' | 'register') {
    this.mode = newMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  fillDemoAccount() {
    this.email = 'user@instamart.com';
    this.password = 'password123';
    this.errorMessage = '';
  }

  fillAdminAccount() {
    this.email = 'admin@instamart.com';
    this.password = 'admin123';
    this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.mode === 'login') {
      if (!this.email || !this.password) {
        this.errorMessage = 'Please fill in both email and password.';
        return;
      }

      const trimmedEmail = this.email.trim();
      const emailToSubmit = trimmedEmail.toLowerCase() === 'admin' ? 'admin@instamart.com' : trimmedEmail;

      this.loading = true;
      this.authService.login({ email: emailToSubmit, password: this.password }).subscribe({
        next: (res) => {
          this.loading = false;
          const isAdmin = this.authService.isAdmin() || res?.user?.role === 'admin' || emailToSubmit.toLowerCase() === 'admin@instamart.com';

          if (isAdmin) {
            this.successMessage = 'Admin login verified! Redirecting to Admin Portal...';
            setTimeout(() => {
              this.router.navigate(['/admin']);
            }, 700);
          } else {
            this.successMessage = 'Login successful! Redirecting...';
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 700);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Invalid login credentials.';
        }
      });
    } else {
      if (!this.name || !this.email || !this.password) {
        this.errorMessage = 'Full Name, Email, and Password are required.';
        return;
      }

      if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long.';
        return;
      }

      this.loading = true;
      this.authService.register({
        name: this.name,
        email: this.email,
        password: this.password,
        phone: this.phone,
        address: this.address
      }).subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = 'Account created successfully! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1200);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Registration failed.';
        }
      });
    }
  }
}

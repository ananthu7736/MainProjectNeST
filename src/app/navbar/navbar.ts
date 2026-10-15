import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


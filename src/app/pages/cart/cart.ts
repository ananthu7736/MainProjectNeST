import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../cart.service';
import { Apiservice } from '../../apiservice';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartService = inject(CartService);
  apiService = inject(Apiservice);
  authService = inject(AuthService);
  router = inject(Router);

  // Form Fields
  name = '';
  phone = '';
  address = '';

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      if (user.name) this.name = user.name;
      if (user.phone) this.phone = user.phone;
      if (user.address) this.address = user.address;
    }
  }

  // Order state
  placingOrder = false;
  orderSuccess = signal<any>(null);

  incrementQuantity(item: any) {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrementQuantity(item: any) {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item.product.id);
  }

  onSubmitCheckout() {
    if (!this.name.trim() || !this.phone.trim() || !this.address.trim()) {
      alert('Please fill out all checkout details.');
      return;
    }

    if (this.cartService.cartCount() === 0) {
      alert('Your cart is empty.');
      return;
    }

    this.placingOrder = true;
    const orderData = {
      items: this.cartService.cartItems(),
      user: {
        name: this.name,
        phone: this.phone,
        address: this.address
      },
      total: this.cartService.cartTotal()
    };

    this.apiService.placeOrder(orderData).subscribe({
      next: (res: any) => {
        this.placingOrder = false;
        this.orderSuccess.set(res);
        this.cartService.clearCart();
        // Reset form
        this.name = '';
        this.phone = '';
        this.address = '';
      },
      error: (err: any) => {
        this.placingOrder = false;
        console.error('Order error:', err);
        alert(err.error?.message || 'Failed to place order. Please try again.');
      }
    });
  }
}

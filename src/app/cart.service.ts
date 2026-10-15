import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  product: any;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Using Angular Signals for reactive state
  private cartItemsSignal = signal<CartItem[]>([]);

  // Read-only computed signals for components to bind to
  cartItems = computed(() => this.cartItemsSignal());
  cartCount = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });
  cartTotal = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  });

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('instamart_cart');
      if (savedCart) {
        try {
          this.cartItemsSignal.set(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
        }
      }
    }
  }

  private saveCart() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('instamart_cart', JSON.stringify(this.cartItemsSignal()));
    }
  }

  addToCart(product: any, qty: number = 1) {
    const currentItems = [...this.cartItemsSignal()];
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = currentItems[existingIndex].quantity;
      const newQty = currentQty + qty;
      
      // Limit to stock if stock information is available
      if (product.stock !== undefined && newQty > product.stock) {
        alert(`Sorry, only ${product.stock} items are available in stock.`);
        currentItems[existingIndex].quantity = product.stock;
      } else {
        currentItems[existingIndex].quantity = newQty;
      }
    } else {
      if (product.stock !== undefined && product.stock <= 0) {
        alert(`Sorry, this item is out of stock.`);
        return;
      }
      currentItems.push({ product, quantity: qty });
    }

    this.cartItemsSignal.set(currentItems);
    this.saveCart();
  }

  removeFromCart(productId: any) {
    const currentItems = this.cartItemsSignal().filter(item => item.product.id !== productId);
    this.cartItemsSignal.set(currentItems);
    this.saveCart();
  }

  updateQuantity(productId: any, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = [...this.cartItemsSignal()];
    const itemIndex = currentItems.findIndex(item => item.product.id === productId);

    if (itemIndex > -1) {
      const product = currentItems[itemIndex].product;
      if (product.stock !== undefined && quantity > product.stock) {
        alert(`Sorry, only ${product.stock} items are available in stock.`);
        currentItems[itemIndex].quantity = product.stock;
      } else {
        currentItems[itemIndex].quantity = quantity;
      }
      this.cartItemsSignal.set(currentItems);
      this.saveCart();
    }
  }

  clearCart() {
    this.cartItemsSignal.set([]);
    this.saveCart();
  }
}

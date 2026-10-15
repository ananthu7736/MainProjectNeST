import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() product: any;

  private cartService = inject(CartService);

  addToCart(event: Event) {
    event.stopPropagation();
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }
}

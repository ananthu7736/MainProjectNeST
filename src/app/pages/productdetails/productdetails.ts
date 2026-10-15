import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apiservice } from '../../apiservice';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productdetails.html',
  styleUrl: './productdetails.css',
})
export class Productdetails {

  productDetails: any;
  id: any;

  private Api = inject(Apiservice);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.Api.getFakeProductById(this.id).subscribe({
      next: (res: any) => {
        if (res) {
          const imagesArr = Array.isArray(res.images) && res.images.length > 0 ? res.images : [res.thumbnail];
          const tagsArr = Array.isArray(res.tags) && res.tags.length >= 2 ? res.tags : [res.category || 'groceries', 'fresh'];
          const reviewsArr = Array.isArray(res.reviews) && res.reviews.length >= 3 ? res.reviews : [
            { reviewerName: 'Rohit S.', rating: 5, comment: 'Super fast delivery, quality is amazing!' },
            { reviewerName: 'Anjali K.', rating: 4, comment: 'Very fresh fruit, packaging was clean.' },
            { reviewerName: 'Gaurav M.', rating: 5, comment: 'Extremely satisfied!' }
          ];

          this.productDetails = {
            ...res,
            availabilityStatus: res.availabilityStatus || 'In Stock',
            weight: res.weight || 0.5,
            minimumOrderQuantity: res.minimumOrderQuantity || 1,
            images: imagesArr,
            dimensions: res.dimensions || { width: 10, height: 10, depth: 10 },
            shippingInformation: res.shippingInformation || 'Standard fast shipping',
            warrantyInformation: res.warrantyInformation || 'Instamart Quality Assured',
            returnPolicy: res.returnPolicy || 'No-questions-asked refund on delivery',
            tags: tagsArr,
            reviews: reviewsArr,
            meta: res.meta || { barcode: res.sku || '1234567', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), qrCode: '' }
          };
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load product detail:', err);
      }
    });
  }

  addToCart() {
    if (this.productDetails) {
      this.cartService.addToCart(this.productDetails);
    }
  }

  buyNow() {
    if (this.productDetails) {
      this.cartService.addToCart(this.productDetails);
      this.router.navigate(['/cart']);
    }
  }
}
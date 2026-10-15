import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apiservice } from '../../apiservice';
import { Card } from '../../card/card';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, Card],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  data: any[] = [];

constructor(
  private Api: Apiservice,
  private cdr: ChangeDetectorRef
) {}

ngOnInit() {
  this.Api.getFakeProducts().subscribe({
    next: (res: any) => {
      if (Array.isArray(res)) {
        this.data = res;
      } else if (res && Array.isArray(res.products)) {
        this.data = res.products;
      } else {
        this.data = [];
      }
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Error fetching products:', err);
    }
  });
}
}

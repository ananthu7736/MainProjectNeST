import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Apiservice } from '../../apiservice';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  apiService = inject(Apiservice);

  orders = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading.set(true);
    this.apiService.getOrders().subscribe({
      next: (res: any) => {
        this.orders.set(res.orders || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching orders:', err);
        this.error.set('Failed to load order history. Please make sure the backend is running.');
        this.loading.set(false);
      }
    });
  }

  readonly trackingStages = [
    { key: 'Received', label: 'Received', icon: 'bi-inbox-fill' },
    { key: 'Confirmed', label: 'Confirmed', icon: 'bi-patch-check-fill' },
    { key: 'Preparing', label: 'Packing', icon: 'bi-box-seam-fill' },
    { key: 'Out for Delivery', label: 'On The Way', icon: 'bi-scooter' },
    { key: 'Delivered', label: 'Delivered', icon: 'bi-check-circle-fill' }
  ];

  getStepIndex(status: string): number {
    switch (status) {
      case 'Received': return 0;
      case 'Confirmed': return 1;
      case 'Preparing': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return -1;
    }
  }

  isStepCompleted(orderStatus: string, stageKey: string): boolean {
    const currentIdx = this.getStepIndex(orderStatus);
    const stageIdx = this.getStepIndex(stageKey);
    return stageIdx !== -1 && currentIdx >= stageIdx;
  }

  isStepActive(orderStatus: string, stageKey: string): boolean {
    return orderStatus === stageKey;
  }
}

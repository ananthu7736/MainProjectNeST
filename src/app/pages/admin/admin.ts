import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Apiservice } from '../../apiservice';
import { AuthService } from '../../auth.service';

export interface OrderItem {
  product: {
    id: number;
    title: string;
    brand?: string;
    thumbnail?: string;
    price: number;
  };
  quantity: number;
}

export interface CustomerOrder {
  id: string;
  user: {
    name: string;
    phone: string;
    address: string;
  };
  total: number;
  status: 'Received' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | string;
  date: string;
  etaMinutes: number;
  items: OrderItem[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit, OnDestroy {
  apiService = inject(Apiservice);
  authService = inject(AuthService);
  router = inject(Router);

  // Orders State
  orders = signal<CustomerOrder[]>([]);
  loading = signal<boolean>(true);
  updatingOrderId = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Filters & Controls
  searchQuery = signal<string>('');
  statusFilter = signal<string>('ALL');
  dateFilter = signal<string>('ALL');
  sortBy = signal<string>('NEWEST');
  activeTab = signal<'active' | 'history' | 'analytics'>('active');

  // Modals
  selectedOrder = signal<CustomerOrder | null>(null);
  showTrackingModal = signal<boolean>(false);
  showInvoiceModal = signal<boolean>(false);

  // Auto-refresh interval
  autoRefresh = signal<boolean>(false);
  private refreshTimer: any = null;

  // Tracking Stages
  readonly trackingStages = [
    { key: 'Received', label: 'Received', icon: 'bi-inbox-fill' },
    { key: 'Confirmed', label: 'Confirmed', icon: 'bi-patch-check-fill' },
    { key: 'Preparing', label: 'Preparing', icon: 'bi-box-seam-fill' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: 'bi-scooter' },
    { key: 'Delivered', label: 'Delivered', icon: 'bi-check-circle-fill' }
  ];

  ngOnInit() {
    // Separate admin authentication protection
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchOrders();
  }

  adminLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  fetchOrders() {
    this.loading.set(true);
    this.apiService.getOrders().subscribe({
      next: (res: any) => {
        const orderList = (res && res.orders) ? res.orders : [];
        this.orders.set(orderList);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching admin orders:', err);
        this.errorMessage.set('Failed to load orders from server.');
        this.loading.set(false);
      }
    });
  }

  toggleAutoRefresh() {
    const nextState = !this.autoRefresh();
    this.autoRefresh.set(nextState);
    if (nextState) {
      this.refreshTimer = setInterval(() => {
        this.apiService.getOrders().subscribe({
          next: (res: any) => {
            if (res && res.orders) {
              this.orders.set(res.orders);
            }
          }
        });
      }, 10000);
      this.showSuccessToast('Auto-refresh activated (10s sync)');
    } else {
      this.stopAutoRefresh();
      this.showSuccessToast('Auto-refresh paused');
    }
  }

  private stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Filtered & Sorted Orders
  filteredOrders = computed(() => {
    let list = [...this.orders()];
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const tab = this.activeTab();
    const dateRange = this.dateFilter();

    // Tab separation
    if (tab === 'active') {
      list = list.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    } else if (tab === 'history') {
      list = list.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');
    }

    // Status filter
    if (status !== 'ALL') {
      list = list.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    // Search query filter
    if (query) {
      list = list.filter(o => {
        const idMatch = o.id.toLowerCase().includes(query);
        const nameMatch = o.user?.name?.toLowerCase().includes(query);
        const phoneMatch = o.user?.phone?.toLowerCase().includes(query);
        const addressMatch = o.user?.address?.toLowerCase().includes(query);
        const itemMatch = o.items?.some(it => it.product?.title?.toLowerCase().includes(query));
        return idMatch || nameMatch || phoneMatch || addressMatch || itemMatch;
      });
    }

    // Date filter
    const now = new Date();
    if (dateRange === 'TODAY') {
      list = list.filter(o => {
        const od = new Date(o.date);
        return od.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(o => new Date(o.date) >= oneWeekAgo);
    }

    // Sorting
    const sort = this.sortBy();
    if (sort === 'NEWEST') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'OLDEST') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sort === 'HIGHEST') {
      list.sort((a, b) => Number(b.total) - Number(a.total));
    } else if (sort === 'LOWEST') {
      list.sort((a, b) => Number(a.total) - Number(b.total));
    }

    return list;
  });

  // Analytics & KPI stats
  stats = computed(() => {
    const all = this.orders();
    const totalOrders = all.length;
    const totalRevenue = all.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const activeOrders = all.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const deliveredOrders = all.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = all.filter(o => o.status === 'Cancelled').length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalOrders,
      totalRevenue,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue
    };
  });

  // Count by status
  countByStatus(status: string): number {
    if (status === 'ALL') return this.orders().length;
    return this.orders().filter(o => o.status.toLowerCase() === status.toLowerCase()).length;
  }

  // Update order status
  updateStatus(order: CustomerOrder, newStatus: string, etaMinutes?: number) {
    if (order.status === newStatus) return;

    this.updatingOrderId.set(order.id);
    const newEta = etaMinutes !== undefined ? etaMinutes : (newStatus === 'Delivered' ? 0 : order.etaMinutes);

    this.apiService.updateOrderStatus(order.id, newStatus, newEta).subscribe({
      next: () => {
        this.orders.update(current =>
          current.map(o => o.id === order.id ? { ...o, status: newStatus, etaMinutes: newEta } : o)
        );

        if (this.selectedOrder()?.id === order.id) {
          this.selectedOrder.set({ ...this.selectedOrder()!, status: newStatus, etaMinutes: newEta });
        }

        this.updatingOrderId.set(null);
        this.showSuccessToast(`Order ${order.id} status updated to "${newStatus}"!`);
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.updatingOrderId.set(null);
        this.errorMessage.set('Failed to update order status.');
      }
    });
  }

  // One-click Smart Advance Status
  advanceStatus(order: CustomerOrder) {
    const nextMap: { [key: string]: string } = {
      'Received': 'Confirmed',
      'Confirmed': 'Preparing',
      'Preparing': 'Out for Delivery',
      'Out for Delivery': 'Delivered'
    };

    const next = nextMap[order.status];
    if (next) {
      let eta = order.etaMinutes;
      if (next === 'Confirmed') eta = 20;
      if (next === 'Preparing') eta = 15;
      if (next === 'Out for Delivery') eta = 8;
      if (next === 'Delivered') eta = 0;
      this.updateStatus(order, next, eta);
    }
  }

  getNextActionLabel(status: string): string | null {
    switch (status) {
      case 'Received': return 'Confirm Order ➔';
      case 'Confirmed': return 'Start Packing ➔';
      case 'Preparing': return 'Dispatch Delivery 🛵';
      case 'Out for Delivery': return 'Mark as Delivered ✅';
      default: return null;
    }
  }

  // Adjust ETA
  adjustEta(order: CustomerOrder, deltaMinutes: number) {
    const newEta = Math.max(0, (order.etaMinutes || 0) + deltaMinutes);
    this.updateStatus(order, order.status, newEta);
  }

  // Delete Order
  deleteOrder(order: CustomerOrder) {
    if (!confirm(`Are you sure you want to remove order "${order.id}"? This action cannot be undone.`)) {
      return;
    }

    this.apiService.deleteOrder(order.id).subscribe({
      next: () => {
        this.orders.update(curr => curr.filter(o => o.id !== order.id));
        if (this.selectedOrder()?.id === order.id) {
          this.closeModals();
        }
        this.showSuccessToast(`Order ${order.id} deleted successfully.`);
      },
      error: (err) => {
        console.error('Error deleting order:', err);
        this.errorMessage.set('Failed to delete order.');
      }
    });
  }

  // Tracking Progress helper
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

  // Modal open/close
  openTracking(order: CustomerOrder) {
    this.selectedOrder.set(order);
    this.showTrackingModal.set(true);
    this.showInvoiceModal.set(false);
  }

  openInvoice(order: CustomerOrder) {
    this.selectedOrder.set(order);
    this.showInvoiceModal.set(true);
    this.showTrackingModal.set(false);
  }

  closeModals() {
    this.showTrackingModal.set(false);
    this.showInvoiceModal.set(false);
    this.selectedOrder.set(null);
  }

  printInvoice() {
    window.print();
  }

  // Switch to admin credentials if not already
  switchToAdmin() {
    this.authService.quickAdminLogin();
    this.showSuccessToast('Switched to Store Administrator role!');
  }

  // Export CSV
  exportCSV() {
    const data = this.filteredOrders();
    if (data.length === 0) {
      alert('No orders to export.');
      return;
    }

    let csv = 'Order ID,Customer Name,Phone,Address,Date,Status,Total (INR),Items Count\n';
    data.forEach(o => {
      const cleanAddress = `"${(o.user?.address || '').replace(/"/g, '""')}"`;
      const cleanName = `"${(o.user?.name || '').replace(/"/g, '""')}"`;
      csv += `${o.id},${cleanName},${o.user?.phone || ''},${cleanAddress},${o.date},${o.status},${o.total},${o.items?.length || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Instamart_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showSuccessToast('Orders report downloaded as CSV');
  }

  private showSuccessToast(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) {
        this.successMessage.set(null);
      }
    }, 4000);
  }
}

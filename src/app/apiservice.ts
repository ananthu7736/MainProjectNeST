import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Essence Mascara Lash Princess",
    description: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.",
    category: "beauty",
    price: 9.99,
    discountPercentage: 10.48,
    rating: 2.56,
    stock: 99,
    brand: "Essence",
    sku: "BEA-ESS-ESS-001",
    availabilityStatus: "In Stock",
    weight: 0.2,
    minimumOrderQuantity: 1,
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"],
    dimensions: { width: 10, height: 10, depth: 10 },
    shippingInformation: "Standard fast shipping",
    warrantyInformation: "Instamart Quality Assured",
    returnPolicy: "No-questions-asked refund on delivery",
    tags: ["beauty", "mascara"],
    reviews: [
      { reviewerName: "Rohit S.", rating: 5, comment: "Super fast delivery, quality is amazing!" },
      { reviewerName: "Anjali K.", rating: 4, comment: "Very fresh fruit, packaging was clean." },
      { reviewerName: "Gaurav M.", rating: 5, comment: "Extremely satisfied!" }
    ],
    meta: { barcode: "1234567", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), qrCode: "" }
  },
  {
    id: 2,
    title: "Eyeshadow Palette with Mirror",
    description: "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks.",
    category: "beauty",
    price: 19.99,
    discountPercentage: 18.19,
    rating: 2.86,
    stock: 33,
    brand: "Glamour Beauty",
    sku: "BEA-GLA-EYE-002",
    availabilityStatus: "In Stock",
    weight: 0.3,
    minimumOrderQuantity: 1,
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"],
    dimensions: { width: 12, height: 12, depth: 5 },
    shippingInformation: "Standard fast shipping",
    warrantyInformation: "1 year warranty",
    returnPolicy: "30 days return",
    tags: ["beauty", "eyeshadow"],
    reviews: [
      { reviewerName: "Priya P.", rating: 5, comment: "Beautiful colors!" },
      { reviewerName: "Siddharth N.", rating: 4, comment: "Good quality mirror." },
      { reviewerName: "Neha R.", rating: 5, comment: "Loved it!" }
    ],
    meta: { barcode: "987654321", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), qrCode: "" }
  },
  {
    id: 3,
    title: "Fresh Red Apples",
    description: "Fresh and sweet red apples imported from premium orchards.",
    category: "groceries",
    price: 150.00,
    discountPercentage: 10.00,
    rating: 4.5,
    stock: 120,
    brand: "FarmFresh",
    sku: "GRO-FAR-APP-003",
    availabilityStatus: "In Stock",
    weight: 1.0,
    minimumOrderQuantity: 1,
    thumbnail: "https://cdn.dummyjson.com/products/images/groceries/Apple/thumbnail.png",
    images: ["https://cdn.dummyjson.com/products/images/groceries/Apple/thumbnail.png"],
    dimensions: { width: 8, height: 8, depth: 8 },
    shippingInformation: "Delivered in 15 mins",
    warrantyInformation: "Freshness Guaranteed",
    returnPolicy: "Instant replacement on spot",
    tags: ["groceries", "fruits"],
    reviews: [
      { reviewerName: "Vikas M.", rating: 5, comment: "Super fresh and sweet!" },
      { reviewerName: "Kavita S.", rating: 5, comment: "Best apples ever." },
      { reviewerName: "Aman T.", rating: 4, comment: "Good packaging." }
    ],
    meta: { barcode: "555444333", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), qrCode: "" }
  }
];

@Injectable({
  providedIn: 'root',
})
export class Apiservice {
  private apiUrl = 'http://localhost:3000/api';
  private dummyUrl = 'https://dummyjson.com/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`).pipe(
      catchError((err) => {
        console.warn('Backend server unreachable, trying DummyJSON API...', err);
        return this.http.get(`${this.dummyUrl}?limit=50`).pipe(
          catchError(() => of({ products: FALLBACK_PRODUCTS }))
        );
      })
    );
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`).pipe(
      catchError((err) => {
        console.warn('Backend server unreachable, trying DummyJSON API by ID...', err);
        return this.http.get(`${this.dummyUrl}/${id}`).pipe(
          catchError(() => {
            const found = FALLBACK_PRODUCTS.find(p => p.id == Number(id)) || FALLBACK_PRODUCTS[0];
            return of(found);
          })
        );
      })
    );
  }

  getFakeProducts(): Observable<any> {
    return this.getProducts();
  }

  getFakeProductById(id: string): Observable<any> {
    return this.getProductById(id);
  }

  private getLocalStoredOrders(): any[] {
    try {
      const stored = localStorage.getItem('instamart_orders');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}

    // Initial demo fallback orders
    const initialOrders = [
      {
        id: 'ORD-1001',
        user: {
          name: 'Aarav Sharma',
          phone: '+91 98765 43210',
          address: 'Flat 402, Skyline Residency, Indiranagar, Bengaluru'
        },
        total: 450,
        status: 'Received',
        date: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        etaMinutes: 20,
        items: [
          {
            product: {
              id: 3,
              title: 'Fresh Red Apples',
              brand: 'FarmFresh',
              thumbnail: 'https://cdn.dummyjson.com/products/images/groceries/Apple/thumbnail.png',
              price: 150
            },
            quantity: 3
          }
        ]
      },
      {
        id: 'ORD-1002',
        user: {
          name: 'Pooja Hegde',
          phone: '+91 98201 12345',
          address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru'
        },
        total: 280,
        status: 'Out for Delivery',
        date: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        etaMinutes: 8,
        items: [
          {
            product: {
              id: 2,
              title: 'Eyeshadow Palette with Mirror',
              brand: 'Glamour Beauty',
              thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp',
              price: 130
            },
            quantity: 1
          },
          {
            product: {
              id: 3,
              title: 'Fresh Red Apples',
              brand: 'FarmFresh',
              thumbnail: 'https://cdn.dummyjson.com/products/images/groceries/Apple/thumbnail.png',
              price: 150
            },
            quantity: 1
          }
        ]
      },
      {
        id: 'ORD-1003',
        user: {
          name: 'Vikram Malhotra',
          phone: '+91 91234 56789',
          address: 'Flat 5B, Green Valley Apts, Koramangala, Bengaluru'
        },
        total: 620,
        status: 'Delivered',
        date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        etaMinutes: 0,
        items: [
          {
            product: {
              id: 3,
              title: 'Fresh Red Apples',
              brand: 'FarmFresh',
              thumbnail: 'https://cdn.dummyjson.com/products/images/groceries/Apple/thumbnail.png',
              price: 150
            },
            quantity: 2
          },
          {
            product: {
              id: 1,
              title: 'Essence Mascara Lash Princess',
              brand: 'Essence',
              thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
              price: 320
            },
            quantity: 1
          }
        ]
      }
    ];
    try {
      localStorage.setItem('instamart_orders', JSON.stringify(initialOrders));
    } catch (e) {}
    return initialOrders;
  }

  private saveLocalOrders(orders: any[]) {
    try {
      localStorage.setItem('instamart_orders', JSON.stringify(orders));
    } catch (e) {}
  }

  placeOrder(orderData: any): Observable<any> {
    const newOrder = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: orderData.user,
      total: orderData.total,
      status: 'Received',
      date: new Date().toISOString(),
      etaMinutes: Math.floor(Math.random() * 15) + 10,
      items: orderData.items
    };

    return this.http.post(`${this.apiUrl}/orders`, orderData).pipe(
      catchError(() => of(newOrder)),
      tap((created: any) => {
        const local = this.getLocalStoredOrders();
        const fullOrder = { ...newOrder, ...created };
        this.saveLocalOrders([fullOrder, ...local.filter(o => o.id !== fullOrder.id)]);
      })
    );
  }

  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`).pipe(
      catchError(() => {
        return of({ orders: this.getLocalStoredOrders() });
      }),
      tap((res: any) => {
        if (res && res.orders && res.orders.length > 0) {
          this.saveLocalOrders(res.orders);
        } else if (res && (!res.orders || res.orders.length === 0)) {
          // If backend returned empty, use stored demo orders
          res.orders = this.getLocalStoredOrders();
        }
      })
    );
  }

  updateOrderStatus(orderId: string, status: string, etaMinutes?: number): Observable<any> {
    // Update local storage first
    const orders = this.getLocalStoredOrders();
    const target = orders.find(o => o.id === orderId);
    if (target) {
      target.status = status;
      if (etaMinutes !== undefined) {
        target.etaMinutes = etaMinutes;
      }
      this.saveLocalOrders(orders);
    }

    return this.http.put(`${this.apiUrl}/orders/${orderId}/status`, { status, etaMinutes }).pipe(
      catchError(() => of({ message: 'Order status updated in local storage', id: orderId, status, etaMinutes }))
    );
  }

  deleteOrder(orderId: string): Observable<any> {
    const orders = this.getLocalStoredOrders().filter(o => o.id !== orderId);
    this.saveLocalOrders(orders);

    return this.http.delete(`${this.apiUrl}/orders/${orderId}`).pipe(
      catchError(() => of({ message: 'Order deleted', id: orderId }))
    );
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`).pipe(
      catchError(() => {
        const orders = this.getLocalStoredOrders();
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
        const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
        const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        return of({
          totalOrders,
          totalRevenue,
          pendingOrders,
          deliveredOrders,
          totalUsers: 2,
          avgOrderValue
        });
      })
    );
  }

  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      catchError((err) => {
        console.warn('Backend server offline, using fallback mock login verification:', err);
        // Fallback for offline mode / demo testing
        const email = credentials.email.trim().toLowerCase();
        const normalized = email === 'admin' ? 'admin@instamart.com' : email;
        const pass = credentials.password ? credentials.password.trim() : '';

        if ((normalized === 'admin@instamart.com' || email === 'admin') && pass === 'admin123') {
          return of({
            message: 'Admin login successful (Offline Demo)',
            token: 'mock-admin-token-999',
            user: {
              id: 999,
              name: 'Store Administrator',
              email: 'admin@instamart.com',
              phone: '9998887770',
              address: 'Instamart HQ Operations Hub',
              role: 'admin'
            }
          });
        }

        if (email === 'user@instamart.com' && credentials.password === 'password123') {
          return of({
            message: 'Login successful (Offline Demo)',
            token: 'mock-jwt-token-12345',
            user: {
              id: 1,
              name: 'Demo User',
              email: 'user@instamart.com',
              phone: '9876543210',
              address: '123 Instamart Street, Tech Park',
              role: 'customer'
            }
          });
        }

        throw new Error(err?.error?.message || 'Invalid email or password');
      })
    );
  }

  registerUser(userData: { name: string; email: string; password: string; phone?: string; address?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      catchError((err) => {
        console.warn('Backend server offline, using fallback mock registration:', err);
        return of({
          message: 'Account created successfully! (Offline Demo)',
          token: `mock-token-${Date.now()}`,
          user: {
            id: Math.floor(Math.random() * 1000) + 10,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            role: 'customer'
          }
        });
      })
    );
  }
}

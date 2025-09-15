import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/** ✅ Define interfaces for strong typing */
export interface OrderItem {
  menuItemId: number;
  Name: string;
  Price: number;
  qty: number;
}

export interface Order {
  Id: number;
  TableId: number;
  Items: any[];
  Status: string;
  Total?: number;          // <-- add this
  GST?: number;
  DiscountPercent?: number;
  DiscountAmount?: number;
  GrandTotal?: number;
}


/** ✅ Service for handling orders and table cache */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/orders`;

  /** Global cache of orders per table */
  private orderMap: { [tableId: number]: OrderItem[] } = {};
  private orderMapSubject = new BehaviorSubject<{ [tableId: number]: OrderItem[] }>({});

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** ✅ Centralized headers */
  private getHeaders() {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  /** ------------------ API METHODS ------------------ */

  createOrder(payload: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.base, payload, this.getHeaders());
  }

  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/pending`, this.getHeaders());
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`, this.getHeaders());
  }

  getAllOrderHistory(): Observable<Order> {
    return this.http.get<Order>(`${this.base}/all/history`, this.getHeaders());
  }

  updateOrder(id: number, payload: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, payload, this.getHeaders());
  }

  // markPaid(id: number): Observable<any> {
  //   return this.http.put(`${this.base}/${id}/mark-paid`, {}, this.getHeaders());
  // }
markPaid(id: number, paymentData: { amount: number; method: string; collectedBy: any }) {
  return this.http.put<any>(`${this.base}/${id}/mark-paid`, paymentData, this.getHeaders());
}


  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`, this.getHeaders());
  }

  printOrder(id: number): Observable<string> {
    return this.http.post(
      `${this.base}/${id}/print`,
      {},
      { ...this.getHeaders(), responseType: 'text' as const }
    );
  }

  getOrderByTable(tableId: number): Observable<Order | null> {
    return this.http.get<Order | null>(`${this.base}/table/${tableId}`, this.getHeaders());
  }

  getOrderPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/print?format=pdf`, {
      ...this.getHeaders(),
      responseType: 'blob'
    });
  }

  kitchenPrint(tableNumber: number, items: OrderItem[]): Observable<string> {
    return this.http.post(
      `${this.base}/kitchen-print`,
      { tableNumber, items },
      { ...this.getHeaders(), responseType: 'text' }
    );
  }

  shareOrder(orderId: number, payload: { phone: string; name: string }): Observable<any> {
    return this.http.post(`${this.base}/${orderId}/share`, payload, this.getHeaders());
  }

  /** ------------------ TABLE ORDER CACHE ------------------ */

  /** Get current order map as observable (reactive) */
  getOrderMap$(): Observable<{ [tableId: number]: OrderItem[] }> {
    return this.orderMapSubject.asObservable();
  }

  /** Get current items for a specific table */
  getOrderByTableId(tableId: number): OrderItem[] {
    return this.orderMap[tableId] || [];
  }

  /** Set items for a specific table and emit changes */
  setOrderForTable(tableId: number, items: OrderItem[]) {
    this.orderMap[tableId] = items;
    this.orderMapSubject.next(this.orderMap);
  }

  /** Clear a specific table */
  clearTable(tableId: number) {
    delete this.orderMap[tableId];
    this.orderMapSubject.next(this.orderMap);
  }

  /** Clear all table orders */
  clearAll() {
    this.orderMap = {};
    this.orderMapSubject.next(this.orderMap);
  }
}

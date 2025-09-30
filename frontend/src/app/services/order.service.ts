import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/** ------------------ TYPES ------------------ */
export interface OrderItem {
  menuItemId: number;
  Name: string;
  Price: number;
  qty: number;
}

export interface Order {
  Id: number;
  TableId: number;
  Items: OrderItem[];
  Status: string;
  Total?: number;
  GST?: number;
  DiscountPercent?: number;
  DiscountAmount?: number;
  GrandTotal?: number;
}

/** ------------------ SERVICE ------------------ */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/orders`;

  /** Reactive table order cache */
  private orderMap: { [tableId: number]: OrderItem[] } = {};
  private orderMapSubject = new BehaviorSubject<{ [tableId: number]: OrderItem[] }>({});

  constructor(private http: HttpClient, private auth: AuthService) {
        this.loadOrderMapFromLocal();

  }

  /** Centralized headers */
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

  /** Get pending order for specific table */
  getPendingOrderByTable(tableId: number): Observable<Order | null> {
    return this.getPendingOrders().pipe(
      map(orders => orders.find(o => o.TableId === tableId) || null)
    );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`, this.getHeaders());
  }

  getAllOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/all/history`, this.getHeaders());
  }

  updateOrder(id: number, payload: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, payload, this.getHeaders());
  }

  /** Mark order as paid with optional payment data */
  markPaid(id: number, paymentData: { amount: number; method: string; collectedBy: any }): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}/mark-paid`, paymentData, this.getHeaders());
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

  // Add this method to OrderService
getOrderByTable(tableId: number) {
  return this.http.get<Order | null>(`${this.base}/table/${tableId}`, this.getHeaders());
}


  
  /** ------------------ TABLE ORDER CACHE ------------------ */

  getOrderMap$(): Observable<{ [tableId: number]: OrderItem[] }> {
    return this.orderMapSubject.asObservable();
  }

  getOrderByTableId(tableId: number): OrderItem[] {
    return this.orderMap[tableId] || [];
  }

  setOrderForTable(tableId: number, items: OrderItem[]) {
    this.orderMap[tableId] = items;
    this.saveOrderMapToLocal();
    this.orderMapSubject.next({ ...this.orderMap });
  }

  clearTable(tableId: number) {
    delete this.orderMap[tableId];
    this.saveOrderMapToLocal();
    this.orderMapSubject.next({ ...this.orderMap });
  }

  clearAll() {
    this.orderMap = {};
    localStorage.removeItem('orderMap');
    this.orderMapSubject.next({});
  }

  /** ------------------ LocalStorage Persistence ------------------ */

  private saveOrderMapToLocal() {
    localStorage.setItem('orderMap', JSON.stringify(this.orderMap));
  }

  private loadOrderMapFromLocal() {
    const data = localStorage.getItem('orderMap');
    if (data) {
      this.orderMap = JSON.parse(data);
      this.orderMapSubject.next({ ...this.orderMap });
    }
  }
}

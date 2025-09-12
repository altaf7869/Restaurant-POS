import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base =  environment.apiUrl +'/orders';
  token: string | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    this.token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post(this.base, payload, this.getHeaders());
  }

  getPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/pending`, this.getHeaders());
  }

  markPaid(id: number): Observable<any> {
    return this.http.put<any>(
      `${this.base}/${id}/mark-paid`,
      {}, // ✅ empty body
      this.getHeaders() // ✅ headers go here (options)
    );
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.base}/${id}`, this.getHeaders());
  }

  updateOrder(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload, this.getHeaders());
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`, this.getHeaders());
  }

  printOrder(id: number): Observable<string> {
    return this.http.post(
      `${this.base}/${id}/print`,
      {}, // empty body
      { ...this.getHeaders(), responseType: 'text' as const } // ✅ headers + response type
    );
  }

  getOrderPdf(id: number) {
  return this.http.get(`${this.base}/${id}/print?format=pdf`, {
    ...this.getHeaders(),
    responseType: 'blob' 
  });
}

kitchenPrint(tableNumber: number, items: any[]) {
  return this.http.post(
    `${this.base}/kitchen-print`,
    { tableNumber, items },
    {  ...this.getHeaders(),responseType: 'text' } // VERY IMPORTANT → so we get raw HTML, not JSON
  );
}

shareOrder(orderId: number, payload: { phone: string, name: string }) {
  return this.http.post(`${this.base}/${orderId}/share`, payload, this.getHeaders());
}


}

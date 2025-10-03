import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PopularItem {
  MenuItemId: number;
  Name: string;
  TotalQty: number;
  TotalSales: number;
}

export interface TrafficItem {
  OrderDate: string;
  TotalOrders: number;
  UniqueTables: number;
}

export interface DashboardData {
  dateRange: { fromDate: string; toDate: string } | null;
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  popularItems: PopularItem[];
  traffic?: TrafficItem[]; 
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

 getDashboard(fromDate?: string | null, toDate?: string | null) {
  const params: any = {};
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  return this.http.get<DashboardData>(`${this.apiUrl}`, { params , headers:this.getHeaders()});
}

}

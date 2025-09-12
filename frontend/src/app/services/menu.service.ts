import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl + '/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  /** GET all menu items */
  getMenuItems(): Observable<any> {
    return this.http.get(`${API_URL}/items`, this.getHeaders());
  }

  /** ADD a new menu item */
  addMenuItem(item: any): Observable<any> {
    return this.http.post(`${API_URL}/items`, item, this.getHeaders());
  }

  /** Optional: UPDATE menu item */
  updateMenuItem(id: number, item: any): Observable<any> {
    return this.http.put(`${API_URL}/items/${id}`, item, this.getHeaders());
  }

  /** Optional: DELETE menu item */
  deleteMenuItem(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/items/${id}`, this.getHeaders());
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token || ''}`
      })
    };
  }

  // 🔑 Users
  getUsers(): Observable<any> { 
    return this.http.get(`${this.baseUrl}/users`, this.getAuthHeaders()); 
  }
  addUser(user: any): Observable<any> { 
    return this.http.post(`${this.baseUrl}/users`, user, this.getAuthHeaders()); 
  }
  updateUser(user: any): Observable<any> { 
    return this.http.put(`${this.baseUrl}/users`, user, this.getAuthHeaders()); 
  }
  deleteUser(id: number): Observable<any> { 
    return this.http.delete(`${this.baseUrl}/users/${id}`, this.getAuthHeaders()); 
  }

  // 📂 Categories
  getCategories(): Observable<any> { 
    return this.http.get(`${this.baseUrl}/categories`, this.getAuthHeaders()); 
  }
  addCategory(category: any): Observable<any> { 
    return this.http.post(`${this.baseUrl}/categories`, category, this.getAuthHeaders()); 
  }
  updateCategory(category: any): Observable<any> { 
    return this.http.put(`${this.baseUrl}/categories`, category, this.getAuthHeaders()); 
  }
  deleteCategory(id: number): Observable<any> { 
    return this.http.delete(`${this.baseUrl}/categories/${id}`, this.getAuthHeaders()); 
  }

  // 🍽 Menu
  getMenu(): Observable<any> { 
    return this.http.get(`${this.baseUrl}/menu`, this.getAuthHeaders()); 
  }
  addMenu(menu: any): Observable<any> { 
    return this.http.post(`${this.baseUrl}/menu`, menu, this.getAuthHeaders()); 
  }
  updateMenu(menu: any): Observable<any> { 
    return this.http.put(`${this.baseUrl}/menu`, menu, this.getAuthHeaders()); 
  }
  deleteMenu(id: number): Observable<any> { 
    return this.http.delete(`${this.baseUrl}/menu/${id}`, this.getAuthHeaders()); 
  }

  // 🪑 Tables
  getTables(): Observable<any> { 
    return this.http.get(`${this.baseUrl}/tables`, this.getAuthHeaders()); 
  }
  addTable(table: any): Observable<any> { 
    return this.http.post(`${this.baseUrl}/tables`, table, this.getAuthHeaders()); 
  }
  updateTable(table: any): Observable<any> { 
    return this.http.put(`${this.baseUrl}/tables`, table, this.getAuthHeaders()); 
  }
  deleteTable(id: number): Observable<any> { 
    return this.http.delete(`${this.baseUrl}/tables/${id}`, this.getAuthHeaders()); 
  }

  // 🧾 Orders
  getOrders(): Observable<any> { 
    return this.http.get(`${this.baseUrl}/orders`, this.getAuthHeaders()); 
  }
}

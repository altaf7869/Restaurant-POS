import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; 
import { environment } from '../../environments/environment';

const API =  environment.apiUrl + '/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${API}/login`, { username, password }).subscribe({
        next: (res: any) => {
          if (res.token) this.setToken(res.token);
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

   // Signup
  signup(username: string, password: string, fullName: string, role: string): Observable<any> {
    return this.http.post(`${API}/register`, { username, password, fullName, role });
  }


  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    return jwtDecode(token);
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.role : null;
  }

  getUserId(): number | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.id : null;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
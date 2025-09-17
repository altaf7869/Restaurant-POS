import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

const API = environment.apiUrl + '/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private usernameSubject = new BehaviorSubject<string | null>(this.getUserName());
  private roleSubject = new BehaviorSubject<string | null>(this.getUserRole());

  username$ = this.usernameSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${API}/login`, { username, password }).subscribe({
        next: (res: any) => {
          if (res.token) {
            this.setToken(res.token);
            this.usernameSubject.next(this.getUserName());
            this.roleSubject.next(this.getUserRole());

            // ✅ Auto-redirect based on role
            const role = this.getUserRole();
            if (role === 'Admin') {
              this.router.navigate(['/users']);
            } else if (role === 'Waiter') {
              this.router.navigate(['/waiter']);
            } else if (role === 'Cashier') {
              this.router.navigate(['/cashier']);
            } else {
              this.router.navigate(['/login']);
            }
          }
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

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
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded?.role || null;
  }

  getUserName(): string | null {
    const decoded = this.decodeToken();
    return decoded?.username || null;
  }

  getUserId(): number | null {
    const decoded = this.decodeToken();
    return decoded?.id || null;
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded?.exp) return true; // No exp claim = invalid
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  logout() {
    localStorage.removeItem('token');
    this.usernameSubject.next(null);
    this.roleSubject.next(null);
    this.router.navigate(['/login']);
  }
}

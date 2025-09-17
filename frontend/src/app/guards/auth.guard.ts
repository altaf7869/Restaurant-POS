import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = this.auth.getToken();

    // ✅ If token exists, verify if it is valid (not expired)
    if (token) {
      const decoded = this.auth.decodeToken();

      if (decoded && (!decoded.exp || Date.now() / 1000 < decoded.exp)) {
        return true; // Token is valid → allow access
      }

      // ❌ If token is expired → clear token & redirect
      this.auth.logout();
    }

    // Redirect to login if not authenticated
    return this.router.parseUrl('/login');
  }
}

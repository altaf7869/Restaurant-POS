import { Component, AfterViewInit, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  loggedInUsername: string | null = null;
  loggedInUserRole: string | null = null;

  menuItems = [
  { label: 'Dashboard', icon: 'bi-people', link: '/dashboard', roles: ['Admin'] },
  { label: 'Users', icon: 'bi-people', link: '/users', roles: ['Admin'] },
  { label: 'Categories', icon: 'bi-grid', link: '/categories', roles: ['Admin'] },
  { label: 'Menu', icon: 'bi-card-list', link: '/menu', roles: ['Admin'] },
  { label: 'Tables', icon: 'bi-table', link: '/tables', roles: ['Admin'] },
  { label: 'Reports', icon: 'bi-file-earmark-text', link: '/order-history', roles: ['Admin'] },
  { label: 'Payments Reports', icon: 'bi-cash-stack', link: '/payment-history', roles: ['Admin'] },
  { label: 'Waiter', icon: 'bi-person-badge', link: '/waiter', roles: ['Admin','Cashier','Waiter'] },
  { label: 'Cashier', icon: 'bi-cash', link: '/cashier', roles: ['Cashier', 'Admin'] },
];


  ngOnInit() {
    this.authService.username$.subscribe(name => {
      this.loggedInUsername = name;
    });

    this.authService.role$.subscribe(role => {
      this.loggedInUserRole = role;
    });
  }

  get visibleMenuItems() {
  return this.menuItems.filter(item =>
    item.roles.includes(this.loggedInUserRole ?? '')
  );
}


  ngAfterViewInit(): void {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarCollapse) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = new (window as any).bootstrap.Collapse(navbarCollapse, { toggle: false });
            bsCollapse.hide();
          }
        });
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}

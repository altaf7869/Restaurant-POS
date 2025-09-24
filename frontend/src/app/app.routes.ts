import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { UserComponent } from './components/auth/user/user.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { TableComponent } from './components/table/table.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { SignupComponent } from './components/auth/signup/signup.component';
import { WaiterComponent } from './components/waiter/waiter.component';
import { CashierComponent } from './components/cashier/cashier.component';
import { OrdersHistoryComponent } from './components/orders-history/orders-history.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  // 🔑 Public routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // 👥 Admin-only routes
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, AdminGuard] },

  { path: 'users', component: UserComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'tables', component: TableComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'order-history', component: OrdersHistoryComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'payment-history', component: PaymentHistoryComponent, canActivate: [AuthGuard, AdminGuard] },

  // 🍽️ Waiter & Cashier routes (just need to be logged in)
  { path: 'waiter', component: WaiterComponent, canActivate: [AuthGuard] },
  { path: 'cashier', component: CashierComponent, canActivate: [AuthGuard] },

  // 🔄 Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

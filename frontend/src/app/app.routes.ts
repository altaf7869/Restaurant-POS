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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'users', component: UserComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'tables', component: TableComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'waiter', component: WaiterComponent, canActivate: [AuthGuard] },
    { path: 'order-history', component: OrdersHistoryComponent, canActivate: [AuthGuard] },
    { path: 'payment-history', component: PaymentHistoryComponent, canActivate: [AuthGuard] },

    { path: 'cashier', component: CashierComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

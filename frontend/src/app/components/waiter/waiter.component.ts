import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService, OrderItem } from '../../services/order.service';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-waiter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchFilterPipe],
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.css']
})
export class WaiterComponent implements OnInit {
  tables: any[] = [];
  categories: any[] = [];
  menu: any[] = [];
  searchText = '';
printedItems: any[] = []; 
  selectedTable: any = null;
  activeCategoryId: number | null = null;
  orderItems: OrderItem[] = [];
userRole: string | null = null;

  constructor(
    private api: ApiService,
    private authService:AuthService,
    private orderService: OrderService,
    private socket: SocketService,
    private cd: ChangeDetectorRef,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.loadTables();
    this.loadCategories();
    this.loadMenu();

    // Subscribe to reactive local orders
    this.orderService.getOrderMap$().subscribe(map => {
      if (this.selectedTable) {
        this.orderItems = map[this.selectedTable.Id] || [];
      }
    });

    // Listen to cashier updates for paid orders
    this.socket.onEvent('orderUpdated').subscribe((updatedOrder: any) => {
      const tableId = updatedOrder.TableId;

      // Update LastOrder for table
      this.tables = this.tables.map(t =>
        t.Id === tableId ? { ...t, LastOrder: updatedOrder } : t
      );

      // Clear local draft if paid
      if (updatedOrder.Status?.toLowerCase() === 'paid') {
        this.orderService.clearTable(tableId);
        if (this.selectedTable?.Id === tableId) {
          this.orderItems = [];
          this.selectedTable = null;
        }
      }

      // If viewing the same table, update items
      if (this.selectedTable?.Id === tableId) {
        this.orderItems = updatedOrder.Items || [];
      }
    });
  }

canRemoveItems(): boolean {
  const isAdminOrCashier = this.userRole === 'Admin' || this.userRole === 'Cashier';
  const isPendingOrder = this.selectedTable?.LastOrder?.Status?.toLowerCase() === 'pending';

  // ✅ Waiters cannot edit a submitted order
  if (isPendingOrder && !isAdminOrCashier) return false;

  // ✅ Admin & Cashier can always edit (even after submit)
  return true;
}


  /** ------------------ Table & Menu ------------------ */
  loadTables() {
    this.api.getTables().subscribe((res: any) => this.tables = res || []);
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: res => {
        this.categories = res || [];
        if (this.categories.length > 0) {
          this.activeCategoryId = this.categories[0].Id;
          const starter = this.categories.find(c => c.Name.toLowerCase() === 'tandoori starter');
          if (starter) this.activeCategoryId = starter.Id;
        }
      },
      error: () => {
        this.categories = [];
        this.activeCategoryId = null;
      }
    });
  }

  loadMenu() {
    this.api.getMenu().subscribe(res => this.menu = res || []);
  }

  getTableStatus(table: any): string {
    const unsavedItems = this.orderService.getOrderByTableId(table.Id);
    if (unsavedItems.length) return 'occupied';
    if (table.LastOrder?.Status?.toLowerCase() === 'pending') return 'pending';
    return 'Free';
  }

  getFilteredMenu() {
    return this.activeCategoryId ? this.menu.filter(m => m.CategoryId === this.activeCategoryId) : this.menu;
  }

  /** ------------------ Table Selection ------------------ */
selectTable(t: any) {
  this.selectedTable = t;

  // 1️⃣ Always check local draft first
  const localDraft = this.orderService.getOrderByTableId(t.Id);

  // 2️⃣ Fetch latest order from backend
  this.orderService.getOrderByTable(t.Id).subscribe({
    next: order => {
      if (order?.Id) {
        // ✅ Only replace LastOrder if it's new or updated
        if (!this.selectedTable.LastOrder || order.Id > (this.selectedTable.LastOrder?.Id || 0)) {
          this.selectedTable.LastOrder = order; // Store full order info
        }
      }

      const backendItems = order?.Items?.map(i => ({ ...i, qty: i.qty || 1 })) || [];
      if (localDraft?.length) {
        // ✅ Prefer local draft if exists (unsaved changes)
        this.orderItems = localDraft;
      } else {
        this.orderItems = backendItems;
      }

      // ✅ Sync orderItems into local storage so next navigation reloads same data
      this.orderService.setOrderForTable(t.Id, this.orderItems);
    },
    error: () => {
      // In case backend fails, still try to load draft
      this.orderItems = localDraft || [];
    }
  });
}

  /** ------------------ Order Operations ------------------ */
private syncOrder(status: 'draft' | 'pending') {
  if (!this.selectedTable) return;

  const payload = {
    Id: this.selectedTable.LastOrder?.Id || null, // backend Id if exists
    TableId: this.selectedTable.Id,
    Items: this.orderItems.map(i => ({
      menuItemId: i.menuItemId,
      Name: i.Name,
      Price: i.Price,
      qty: i.qty
    })),
    Total: this.getOrderTotal(),
    Status: status,
    UpdatedAt: new Date().toISOString()
  };

  console.log('Syncing order to cashier:', payload);
  this.socket.emitEvent('orderUpdated', payload);
}

 addToOrder(item: any) {
  if (!this.selectedTable) return;

  const existing = this.orderItems.find(i => i.menuItemId === item.Id);
  if (existing) existing.qty++;
  else this.orderItems.push({ menuItemId: item.Id, Name: item.Name, Price: item.Price, qty: 1 });

  this.updateOrder();
}

increaseQty(i: OrderItem) {
   if (!this.canRemoveItems()) {
    this.toast.warning('Only Admin or Cashier can remove items.');
    return;
  }
  i.qty++;
  this.updateOrder(); // sync immediately
}

decreaseQty(i: OrderItem) {
   if (!this.canRemoveItems()) {
    this.toast.warning('Only Admin or Cashier can remove items.');
    return;
  }
  i.qty > 1 ? i.qty-- : this.removeItem(i);
  this.updateOrder(); // sync immediately
}

removeItem(i: OrderItem) { 
  if (!this.canRemoveItems()) {
    this.toast.warning('Only Admin or Cashier can remove items.');
    return;
  }
  this.orderItems = this.orderItems.filter(x => x.menuItemId !== i.menuItemId); 
  this.updateOrder(); 
}

private updateOrder() {
  if (!this.selectedTable) return;

  this.orderService.setOrderForTable(this.selectedTable.Id, this.orderItems);

  const wasSubmitted = this.selectedTable?.LastOrder?.Status?.toLowerCase() === 'pending';
  const status: 'draft' | 'pending' = wasSubmitted ? 'pending' : 'draft';

  const payload = {
    Id: wasSubmitted ? this.selectedTable?.LastOrder?.Id : null,
    TableId: this.selectedTable.Id,
    Items: this.orderItems.map(i => ({
      menuItemId: i.menuItemId,
      Name: i.Name,
      Price: i.Price,
      qty: i.qty
    })),
    Total: this.getOrderTotal(),
    Status: status,
    UpdatedAt: new Date().toISOString(),
    UpdatedBy: 'waiter'
  };

  if (wasSubmitted) {
    this.orderService.updateOrder(this.selectedTable.LastOrder.Id, payload).subscribe({
      next: (updatedFromDb) => {
        // 🔑 Always refresh LastOrder from backend response
        this.selectedTable.LastOrder = updatedFromDb;
        this.socket.emitEvent('orderUpdated', updatedFromDb);
      },
      error: (err) => console.error('Failed to update submitted order:', err)
    });
  } else {
    this.socket.emitEvent('orderUpdated', payload);
  }
}



  getOrderTotal() {
    return this.orderItems.reduce((sum, i) => sum + i.Price * i.qty, 0);
  }

  /** ------------------ Clear Order ------------------ */
  clearOrder() {
     if (!this.canRemoveItems()) return;
    if (!this.selectedTable) { this.toast.info('Select table first'); return; }
    const tableId = this.selectedTable.Id;

    this.orderService.getOrderByTable(tableId).subscribe({
      next: order => {
        if (order?.Status?.toLowerCase() === 'pending') {
          this.toast.warning(`Order for Table #${this.selectedTable.TableNumber} is already submitted. Cannot clear it.`);
          return;
        }

        if (!this.orderItems.length) { this.toast.info('No items to clear'); return; }
        if (!confirm(`Clear draft order for Table #${this.selectedTable.TableNumber}?`)) return;

        this.orderItems = [];
        this.orderService.clearTable(tableId);
        this.syncOrder('draft');

        this.toast.success(`Draft order cleared for Table #${this.selectedTable.TableNumber}.`);
        this.selectedTable = null;
      },
      error: () => this.toast.error('Failed to verify order status. Try again.')
    });
  }

  /** ------------------ Submit Order ------------------ */
  submitOrder() {
    if (!this.selectedTable) { this.toast.info('Select table first'); return; }
    if (!this.orderItems.length) { this.toast.info('Add items first'); return; }

    const payload = {
      TableId: this.selectedTable.Id,
      WaiterId: 1,
      Items: this.orderItems.map(i => ({
        menuItemId: i.menuItemId,
        Name: i.Name,
        Price: i.Price,
        qty: i.qty
      })),
      Total: this.getOrderTotal(),
      Status: 'pending'
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Order submitted to cashier');

        // Set LastOrder with Id returned from backend
        this.selectedTable.LastOrder = { ...payload, Id: res.Id };

        this.orderService.clearTable(this.selectedTable.Id);

        this.tables = this.tables.map(t =>
          t.Id === this.selectedTable.Id ? { ...t, LastOrder: this.selectedTable.LastOrder } : t
        );

        // Emit to cashier
        this.syncOrder('pending');

        this.orderItems = [];
        this.selectedTable = null;
      },
      error: () => this.toast.error('Order submission failed')
    });
  }

// Track how many qty of each item has already been printed
printedQtyMap: { [menuItemId: number]: number } = {};

printForKitchen() {
  if (!this.orderItems.length) return;

  // find only qty difference
  const newItems: OrderItem[] = [];

  this.orderItems.forEach(item => {
    const alreadyPrinted = this.printedQtyMap[item.menuItemId] || 0;

    if (item.qty > alreadyPrinted) {
      // only the extra qty is new
      const diff = item.qty - alreadyPrinted;

      newItems.push({
        ...item,
        qty: diff   // ✅ only print the new qty
      });
    }
  });

  if (!newItems.length) {
    console.log("No new items to print.");
    return;
  }

  this.orderService.kitchenPrint(this.selectedTable.TableNumber, newItems)
    .subscribe({
      next: html => {
        const w = window.open('', '_blank', 'width=400,height=600');
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.write(`
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(() => window.close(), 800);
            }
          </script>
        `);
        w.document.close();

        // ✅ update printedQtyMap after successful print
        newItems.forEach(item => {
          this.printedQtyMap[item.menuItemId] =
            (this.printedQtyMap[item.menuItemId] || 0) + item.qty;
        });
      },
      error: err => console.error('Kitchen Print API Error:', err)
    });
}

}

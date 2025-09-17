import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';

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

  selectedTable: any = null;
  activeCategoryId: number | null = null;
  orderItems: any[] = [];

  // Maps tableId -> unsaved order items
  orderMap: { [tableId: number]: any[] } = {};

  constructor(
    private api: ApiService,
    private orderService: OrderService,
    private socket: SocketService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load unsaved waiter orders from localStorage first
    this.loadOrderMapFromLocal();

    this.loadTables();
    this.loadCategories();
    this.loadMenu();

    // Subscribe to orderMap changes
    this.orderService.getOrderMap$().subscribe(orderMap => {
      this.orderMap = { ...orderMap, ...this.orderMap }; // merge with localStorage
      if (this.selectedTable) {
        this.orderItems = this.orderMap[this.selectedTable.Id] || [];
      }
    });

    // Listen for cashier updates
    this.socket.onEvent('orderUpdated').subscribe((updatedOrder: any) => {
      const tableId = updatedOrder.TableId;

      // Paid → clear unsaved items & mark Free
      if (updatedOrder.Status === 'Paid') {
        this.orderMap[tableId] = [];
        this.saveOrderMapToLocal();

        // Clear current selection if matches
        if (this.selectedTable?.Id === tableId) {
          this.orderItems = [];
          this.selectedTable = null;
        }

        // Update table list
        this.tables = this.tables.map(t =>
          t.Id === tableId ? { ...t, LastOrder: updatedOrder } : t
        );
      } else {
        // Update table LastOrder for pending status
        this.tables = this.tables.map(t =>
          t.Id === tableId ? { ...t, LastOrder: updatedOrder } : t
        );
      }
    });
  }

  /** Save unsaved orders to localStorage */
  saveOrderMapToLocal() {
    localStorage.setItem('orderMap', JSON.stringify(this.orderMap));
  }

  /** Load unsaved orders from localStorage */
  loadOrderMapFromLocal() {
    const map = localStorage.getItem('orderMap');
    if (map) this.orderMap = JSON.parse(map);
  }

  /** Load all tables from API */
  loadTables() {
    this.api.getTables().subscribe((res: any) => {
      this.tables = res || [];
    });
  }

  /** Get table status based on unsaved & backend orders */
  getTableStatus(table: any): string {
    const unsavedItems = this.orderMap?.[table.Id] || [];
    if (unsavedItems.length > 0) return 'occupied';

    const lastOrder = table.LastOrder;
    if (lastOrder?.Status?.toLowerCase() === 'pending') return 'pending';
    if (lastOrder?.Status?.toLowerCase() === 'paid') return 'Free';

    return 'Free';
  }

  /** Load categories and set active */
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
      error: err => {
        console.error('Failed to load categories:', err);
        this.categories = [];
        this.activeCategoryId = null;
      }
    });
  }

  /** Load full menu */
  loadMenu() {
    this.api.getMenu().subscribe(res => this.menu = res || []);
  }

  /** Select table */
  selectTable(t: any) {
    this.selectedTable = t;

    // Load unsaved orders for this table
    this.orderItems = this.orderMap[t.Id] || [];

    if (!this.orderItems.length) {
      // Fetch backend order if nothing cached
      this.orderService.getOrderByTable(t.Id).subscribe({
        next: order => {
          this.orderItems = order?.Items.map(i => ({ ...i, qty: i.qty || 1 })) || [];
          this.orderMap[t.Id] = this.orderItems;
          this.saveOrderMapToLocal();

          if (this.orderItems.length) t.Status = 'occupied';
        },
        error: () => {
          this.orderItems = [];
          this.orderMap[t.Id] = [];
          this.saveOrderMapToLocal();
        }
      });
    }
  }

  /** Filter menu by category */
  getFilteredMenu() {
    return this.activeCategoryId
      ? this.menu.filter(m => m.CategoryId === this.activeCategoryId)
      : this.menu;
  }

  /** Add item to order */
  addToOrder(item: any) {
    const existing = this.orderItems.find(i => i.Id === item.Id);
    if (existing) existing.qty++;
    else this.orderItems.push({ ...item, qty: 1 });

    this.orderMap[this.selectedTable.Id] = this.orderItems;
    this.saveOrderMapToLocal();
  }

  increaseQty(i: any) {
    i.qty++;
    this.orderMap[this.selectedTable.Id] = this.orderItems;
    this.saveOrderMapToLocal();
  }

  decreaseQty(i: any) {
    if (i.qty > 1) i.qty--;
    else this.removeItem(i);

    this.orderMap[this.selectedTable.Id] = this.orderItems;
    this.saveOrderMapToLocal();
  }

  removeItem(it: any) {
    this.orderItems = this.orderItems.filter(x => x.Id !== it.Id);
    this.orderMap[this.selectedTable.Id] = this.orderItems;
    this.saveOrderMapToLocal();
  }

  /** Calculate total */
  getOrderTotal() {
    return this.orderItems.reduce((sum, i) => sum + i.Price * i.qty, 0);
  }

  /** Submit order */
  submitOrder() {
    if (!this.selectedTable) { alert('Select table'); return; }
    if (!this.orderItems.length) { alert('Add items'); return; }

    const payload = {
      TableId: this.selectedTable.Id,
      WaiterId: 1,
      Items: this.orderItems.map(i => ({
        menuItemId: i.Id,
        Name: i.Name,
        Price: i.Price,
        qty: i.qty
      })),
      Total: this.getOrderTotal(),
      Status: 'pending'
    };

    this.orderService.createOrder(payload).subscribe({
      next: () => {
        alert('Order submitted');

        // Clear unsaved items
        this.orderMap[this.selectedTable.Id] = [];
        this.saveOrderMapToLocal();

        // Update table LastOrder as pending
        this.selectedTable.LastOrder = { Status: 'pending' };

        this.orderItems = [];
        this.selectedTable = null;
      },
      error: err => {
        console.error(err);
        alert('Order failed');
      }
    });
  }

  /** Print preview */
  printPreview(orderId?: number) {
    if (!orderId) return;
    this.orderService.printOrder(orderId).subscribe(html => {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
      }
    });
  }

  /** Kitchen print */
  printForKitchen() {
    if (!this.orderItems.length) return;

    this.orderService.kitchenPrint(this.selectedTable.TableNumber, this.orderItems)
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
        },
        error: err => console.error('Kitchen Print API Error:', err)
      });
  }
}

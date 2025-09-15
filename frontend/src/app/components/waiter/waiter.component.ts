import { Component, OnInit } from '@angular/core';
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

  constructor(
    private api: ApiService,
    private orderService: OrderService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.loadTables();
    this.loadCategories();
    this.loadMenu();

    // Subscribe to order map updates (persistent across screens)
    this.orderService.getOrderMap$().subscribe(orderMap => {
      if (this.selectedTable) {
        this.orderItems = orderMap[this.selectedTable.Id] || [];
      }
    });

    // Listen for socket updates (cashier paid)
    this.socket.onEvent('orderUpdated').subscribe((updatedOrder: any) => {
      this.loadTables();

      const tableId = updatedOrder.TableId;

      if (updatedOrder.Status === 'paid') {
        // Clear cached order
        this.orderService.clearTable(tableId);

        // If currently selected table is this one, clear items
        if (this.selectedTable?.Id === tableId) {
          this.orderItems = [];
          this.selectedTable = null;
        }

        // Mark table as Free
        this.tables = this.tables.map(t =>
          t.Id === tableId ? { ...t, Status: 'Free' } : t
        );
      }
    });
  }

  /** Load all tables */
  loadTables() {
    this.api.getTables().subscribe(res => this.tables = res);
  }

  /** Load categories */
  loadCategories() {
    this.api.getCategories().subscribe(res => this.categories = res);
  }

  /** Load full menu */
  loadMenu() {
    this.api.getMenu().subscribe(res => this.menu = res);
  }

  /** Select table */
  selectTable(t: any) {
    this.selectedTable = t;

    // Mark table Occupied if Free
    if (t.Status === 'Free') t.Status = 'Occupied';

    // Load cached order
    this.orderItems = this.orderService.getOrderByTableId(t.Id);

    if (!this.orderItems.length) {
      // Fetch from backend if nothing cached
      this.orderService.getOrderByTable(t.Id).subscribe({
        next: order => {
          this.orderItems = order?.Items.map(i => ({ ...i, qty: i.qty || 1 })) || [];
          this.orderService.setOrderForTable(t.Id, this.orderItems);

          if (this.orderItems.length) t.Status = 'Occupied';
        },
        error: () => {
          this.orderItems = [];
          this.orderService.setOrderForTable(t.Id, []);
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

    this.orderService.setOrderForTable(this.selectedTable.Id, this.orderItems);

    // Mark table Occupied if Free
    this.tables = this.tables.map(t =>
      t.Id === this.selectedTable.Id && t.Status === 'Free'
        ? { ...t, Status: 'Occupied' }
        : t
    );
  }

  increaseQty(i: any) {
    i.qty++;
    this.orderService.setOrderForTable(this.selectedTable.Id, this.orderItems);
  }

  decreaseQty(i: any) {
    if (i.qty > 1) i.qty--;
    else this.removeItem(i);

    this.orderService.setOrderForTable(this.selectedTable.Id, this.orderItems);
  }

  removeItem(it: any) {
    this.orderItems = this.orderItems.filter(x => x.Id !== it.Id);
    this.orderService.setOrderForTable(this.selectedTable.Id, this.orderItems);
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

        // Mark table as pending
        this.tables = this.tables.map(t =>
          t.Id === this.selectedTable.Id ? { ...t, Status: 'pending' } : t
        );

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

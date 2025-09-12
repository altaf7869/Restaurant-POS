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

    // Listen for updates (optional)
    // this.socket.on<any>('orderUpdated').subscribe(updated => {
    //   // handle if waiter should be notified (e.g., order status changes)
    // });
  }

  loadTables() {
    this.api.getTables().subscribe(res => {
      this.tables = res;
    });
  }

  loadCategories() { this.api.getCategories().subscribe(res => this.categories = res); }
  loadMenu() { this.api.getMenu().subscribe(res => this.menu = res); }

  selectTable(t: any) {
    this.selectedTable = t;
    this.orderItems = [];
    // Optionally load existing order for this table from backend (if you store one)
  }

  getFilteredMenu() {
    if (!this.activeCategoryId) return this.menu;
    return this.menu.filter(m => m.CategoryId === this.activeCategoryId);
  }

  addToOrder(item: any) {
    const ex = this.orderItems.find(i => i.Id === item.Id);
    if (ex) ex.qty++;
    else this.orderItems.push({ ...item, qty: 1 });
  }
  increaseQty(i: any) { i.qty++; }
  decreaseQty(i: any) { if (i.qty > 1) i.qty--; else this.removeItem(i); }
  removeItem(it: any) { this.orderItems = this.orderItems.filter(x => x.Id !== it.Id); }

  getOrderTotal() { return this.orderItems.reduce((s, i) => s + i.Price * i.qty, 0); }

  submitOrder() {
  if (!this.selectedTable) { alert('Select table'); return; }
  if (!this.orderItems.length) { alert('Add items'); return; }

  const payload = {
    TableId: this.selectedTable.Id, // match backend column
    WaiterId: 1, // replace with actual waiter id from auth/session
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
    next: (res) => {
      alert('Order submitted');
      // mark table occupied locally
      this.tables = this.tables.map(t => t.Id === this.selectedTable.Id ? { ...t, IsActive: true, isOccupied: true } : t);
      this.selectedTable = null;
      this.orderItems = [];
    },
    error: (err) => {
      console.error(err);
      alert('Order failed');
    }
  });
}


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

  printForKitchen() {
  if (!this.orderItems || this.orderItems.length === 0) {
    console.warn('No items to print for kitchen');
    return;
  }

  this.orderService.kitchenPrint(this.selectedTable.TableNumber, this.orderItems)
    .subscribe({
      next: (html: string) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) {
          console.error('Failed to open print window');
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);

        // Use window.onload so styles and DOM are fully ready before printing
        printWindow.document.write(`
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(() => window.close(), 800);
            }
          </script>
        `);

        printWindow.document.close();
      },
      error: (err) => {
        console.error('Kitchen Print API Error:', err);
      }
    });
}


}
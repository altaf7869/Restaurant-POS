import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.css']
})
export class CashierComponent implements OnInit {
  orders: any[] = [];
selectedOrder: any;
customerName = '';
customerPhone = '';

  constructor(private orderService: OrderService, private socket: SocketService) {}

  ngOnInit(): void {
    this.loadOrders();

    this.socket.onEvent('orderCreated').subscribe((newOrder: any) => {
      const order = { ...newOrder, Items: this.parseItems(newOrder.Items) };
      this.orders.unshift(order);
    });

    this.socket.onEvent('orderUpdated').subscribe((updated: any) => {
      const order = { ...updated, Items: this.parseItems(updated.Items) };
      const idx = this.orders.findIndex(o => o.Id === order.Id);
      if (idx > -1) this.orders[idx] = order;
      else this.orders.unshift(order);
    });

    this.socket.onEvent('orderDeleted').subscribe((payload: any) => {
      this.orders = this.orders.filter(o => o.Id !== payload.id);
    });
  }

  loadOrders() {
    this.orderService.getPendingOrders().subscribe(res => {
      // Parse Items for all orders
      this.orders = res.map(o => ({ ...o, Items: this.parseItems(o.Items) }));
     // console.log(this.orders);
    });
  }

  parseItems(items: any) {
    if (!items) return [];
    try {
      return typeof items === 'string' ? JSON.parse(items) : items;
    } catch (err) {
      console.error('Failed to parse Items JSON', err);
      return [];
    }
  }

  // markAsPaid(order: any) {
  //   this.orderService.updateOrder(order.Id, { status: 'paid' }).subscribe(() => {
  //     alert('Marked paid');
  //     this.loadOrders();
  //   });
  // }

  cancelOrder(order: any) {
    if (!confirm('Cancel order?')) return;
    this.orderService.deleteOrder(order.Id).subscribe(() => this.loadOrders());
  }

  markAsPaid(order: any) {
    this.orderService.markPaid(order.Id).subscribe({
      next: updated => {
        updated.Items = JSON.parse(updated.Items);
        const idx = this.orders.findIndex(o => o.Id === updated.Id);
        if (idx > -1) this.orders[idx] = updated;
        alert('Order marked as paid');
        this.loadOrders();
      },
      error: err => console.error(err)
    });
  }


  viewOrder(order: any) {
  this.orderService.printOrder(order.Id).subscribe({
    next: (html: string) => {
      const w = window.open('', '_blank', 'width=400,height=600');
      if (!w) return;

      w.document.open();
      w.document.write(html);

      // Inject auto-print + auto-close
      w.document.write(`
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      `);

      w.document.close();
    },
    error: (err) => console.error('Print Error:', err)
  });
}

shareBill(form: any) {
  if (!form.valid || !this.selectedOrder) return;

  const payload = {
    name: this.customerName,
    phone: this.customerPhone
  };

  this.orderService.shareOrder(this.selectedOrder.Id, payload).subscribe({
    next: (res: any) => {
      alert(res.message);
      const modalEl = document.getElementById('shareBillModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
      this.customerName = '';
      this.customerPhone = '';
    },
    error: (err) => {
      console.error('Share Bill Error:', err);
      alert('Error sharing bill');
    }
  });
}

}

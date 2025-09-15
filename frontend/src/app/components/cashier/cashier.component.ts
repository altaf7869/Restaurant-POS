import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
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

  constructor(private orderService: OrderService, private socket: SocketService, private authService:AuthService) {}

  ngOnInit(): void {
    this.loadOrders();

    this.socket.onEvent('orderCreated').subscribe((newOrder: any) => {
      this.orders.unshift(this.prepareOrder(newOrder));
    });

    this.socket.onEvent('orderUpdated').subscribe((updated: any) => {
      const order = this.prepareOrder(updated);
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
      this.orders = res.map(o => this.prepareOrder(o));
    });
  }

  prepareOrder(order: any) {
    order.Items = this.parseItems(order.Items);
    order.DiscountPercent = Number(order.DiscountPercent) || 0;
    order.DiscountAmount = Number(order.DiscountAmount) || 0;
    order.GST = Number(order.GST) || 0;
    order.GrandTotal = this.calculateGrandTotal(order);
    return order;
  }

  parseItems(items: any): any[] {
    if (!items) return [];
    try {
      return typeof items === 'string' ? JSON.parse(items) : Array.isArray(items) ? items : [];
    } catch (err) {
      console.error('Failed to parse Items JSON', err);
      return [];
    }
  }

getSubtotal(order: any): number {
  const items = Array.isArray(order.Items) ? order.Items : [];
  return items.reduce((sum: number, item: any) => {
    const price = Number(item.Price ?? item.price) || 0;
    const qty = Number(item.Qty ?? item.qty) || 0;
    return sum + price * qty;
  }, 0);
}


  updateDiscount(order: any): void {
    const subtotal = this.getSubtotal(order);
    const discountPercent = Number(order.DiscountPercent) || 0;
    order.DiscountAmount = (subtotal * discountPercent) / 100;
    order.GrandTotal = this.calculateGrandTotal(order);
  }

  calculateGrandTotal(order: any): number {
    const subtotal = this.getSubtotal(order);
    const discount = Math.min(Number(order.DiscountAmount) || 0, subtotal);
    const gstPercent = Number(order.GST) || 0;
    const total = (subtotal - discount) * (1 + gstPercent / 100);
    return Number(total.toFixed(2));
  }

  getFinalTotal(order: any): number {
    return this.calculateGrandTotal(order);
  }

 applyDiscount(order: any): void {
  if (!order.Items || !Array.isArray(order.Items) || order.Items.length === 0) {
    alert('No items found in the order. Cannot apply discount.');
    return;
  }

  this.updateDiscount(order);

 this.orderService.updateOrder(order.Id, {
    DiscountPercent: Number(order.DiscountPercent) || 0,
    DiscountAmount: Number(order.DiscountAmount) || 0,
    Total: order.GrandTotal,
    Items: order.Items 
  }).subscribe({
    next: (response) => {
      console.log('Backend response:', response);
      alert('Discount applied successfully');
      const modalEl = document.getElementById('discountModal');
      if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
    },
    error: err => {
      console.error('Failed to apply discount:', err);
      alert('Failed to apply discount');
    }
  });
}

 openPaymentModal(order: any) {
    this.selectedOrder = order;
    const modal = new bootstrap.Modal(document.getElementById('paymentModal')!);
    modal.show();
  }


  // markAsPaid(order: any) {
  //   this.orderService.markPaid(order.Id).subscribe({
  //     next: updated => {
  //       this.orders = this.orders.filter(o => o.Id !== updated.Id);
  //       alert(`Order paid. Final Total: ₹${order.GrandTotal.toFixed(2)}`);
  //     },
  //     error: err => console.error(err)
  //   });
  // }

confirmPayment(method: 'Online' | 'Cash') {
  if (!this.selectedOrder) {
    alert("No order selected!");
    return;
  }

  const loggedInUser = this.authService.getUserId(); // Logged-in user ID
  const paymentPayload = {
    amount: this.selectedOrder.GrandTotal,
    method: method,
    collectedBy: loggedInUser
  };

  this.orderService.markPaid(this.selectedOrder.Id, paymentPayload).subscribe({
    next: updated => {
      this.orders = this.orders.filter(o => o.Id !== updated.Id);

      // Close modal after payment
      const modalEl = document.getElementById('paymentModal');
      const modal = bootstrap.Modal.getInstance(modalEl!);
      modal.hide();

      alert(`Order paid via ${method}. Final Total: ₹${this.selectedOrder.GrandTotal.toFixed(2)}`);
      this.selectedOrder = null;
    },
    error: err => console.error(err)
  });
}


  cancelOrder(order: any) {
    if (!confirm('Cancel order?')) return;
    this.orderService.deleteOrder(order.Id).subscribe(() => this.loadOrders());
  }

  viewOrder(order: any) {
    this.orderService.printOrder(order.Id).subscribe({
      next: (html: string) => {
        const w = window.open('', '_blank', 'width=400,height=600');
        if (!w) return;
        w.document.write(html);
        w.document.write(`<script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>`);
        w.document.close();
      },
      error: err => console.error('Print Error:', err)
    });
  }

  shareBill(form: any) {
    if (!form.valid || !this.selectedOrder) return;
    const payload = { name: this.customerName, phone: this.customerPhone };
    this.orderService.shareOrder(this.selectedOrder.Id, payload).subscribe({
      next: (res: any) => {
        alert(res.message);
        const modalEl = document.getElementById('shareBillModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        this.customerName = '';
        this.customerPhone = '';
      },
      error: err => {
        console.error('Share Bill Error:', err);
        alert('Error sharing bill');
      }
    });
  }
}

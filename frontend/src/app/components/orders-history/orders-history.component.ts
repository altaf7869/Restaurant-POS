import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any; // Required for Bootstrap 5 modal in TS

@Component({
  selector: 'app-orders-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-history.component.html',
  styleUrls: ['./orders-history.component.css']
})
export class OrdersHistoryComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  filter = { startDate: '', endDate: '' };

  selectedOrder: any = null;
  selectedOrderItems: any[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5; // Show 5 orders per page
  totalPages: number = 0;
  pagedOrders: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.setDefaultDates();
    this.fetchOrders();
  }

  // ✅ Set start and end date to today's date by default
  setDefaultDates() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    this.filter.startDate = todayStr;
    this.filter.endDate = todayStr;
  }

fetchOrders() {
  this.orderService.getAllOrderHistory().subscribe((orderData: any) => {
    this.orders = orderData.map((o: any) => ({
      ...o,
      Items: this.parseItems(o.Items)
    }));

    // Apply today's date filter automatically
    this.applyFilter();
  });
}

// Total orders count
get totalOrdersCount(): number {
  return this.orders?.length || 0;
}

// Today's orders count
get todaysOrdersCount(): number {
  const today = new Date();
  return this.filteredOrders?.filter(o => {
    const orderDate = new Date(o.CreatedAt);
    return orderDate.toDateString() === today.toDateString();
  }).length || 0;
}


  parseItems(items: any) {
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch {
        return [];
      }
    }
    return items || [];
  }

  getFinalTotal(order: any) {
    const items = this.parseItems(order.Items);
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.Price || 0) * item.qty, 0);
    const discount = order.DiscountAmount || 0;
    const gst = order.GST || 0;
    return subtotal - discount + ((subtotal - discount) * gst / 100);
  }

applyFilter() {
  const startStr = this.filter.startDate ? this.filter.startDate : null;
  const endStr = this.filter.endDate ? this.filter.endDate : null;

  this.filteredOrders = this.orders.filter(o => {
    const orderDateStr = new Date(o.CreatedAt).toISOString().split('T')[0]; // 'YYYY-MM-DD'
    return (!startStr || orderDateStr >= startStr) && (!endStr || orderDateStr <= endStr);
  });

  this.currentPage = 1;
  this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  this.updatePagedOrders();
}

  updatePagedOrders() {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    this.pagedOrders = this.filteredOrders.slice(startIdx, endIdx);
  }

goToPage(page: any) {
  if (typeof page !== 'number') return; 
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.updatePagedOrders();
}
  // Generate pagination numbers dynamically with ellipses
get paginationRange(): (number | string)[] {
  const total = this.totalPages;
  const current = this.currentPage;
  const delta = 2; // how many pages to show before/after current
  const range: (number | string)[] = [];

  // Always include first page
  range.push(1);

  // Calculate range of pages to display
  let left = current - delta;
  let right = current + delta;

  if (left < 2) left = 2;
  if (right > total - 1) right = total - 1;

  // Add left ellipsis if needed
  if (left > 2) range.push('...');

  // Add middle range
  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  // Add right ellipsis if needed
  if (right < total - 1) range.push('...');

  // Always include last page if more than one page
  if (total > 1) range.push(total);

  return range;
}


  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  viewItems(order: any) {
    this.selectedOrder = order;
    this.selectedOrderItems = this.parseItems(order.Items);

    const modalEl = document.getElementById('itemsModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // Subtotal without GST or discount
calculateSubtotal(order: any) {
  if (!order || !order.Items) return 0; // ✅ Avoid null error
  const items = this.parseItems(order.Items);
  return items.reduce((sum: number, item: any) => sum + (item.Price || 0) * item.qty, 0);
}

// GST calculation
calculateGST(order: any) {
  if (!order) return 0; // ✅ Avoid null error
  const subtotal = this.calculateSubtotal(order) - (order.DiscountAmount || 0);
  return subtotal * ((order.GST || 0) / 100);
}


  downloadCSV() {
    if (this.filteredOrders.length === 0) return;

    const rows = this.filteredOrders.map(o => ({
      'Order ID': o.Id,
      'Table': o.TableId,
      'Items': this.parseItems(o.Items)
        .map((it: any) => `${it.Name} (x${it.qty})`)
        .join(', '),
      'Total': this.getFinalTotal(o),
      'Status': o.Status,
      'Date': new Date(o.CreatedAt).toLocaleDateString()
    }));

    const csv = this.convertToCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  convertToCSV(objArray: any[]) {
    const array = [Object.keys(objArray[0])].concat(objArray.map(o => Object.values(o)));
    return array.map(it => it.join(',')).join('\n');
  }

  downloadExcel() {
    if (this.filteredOrders.length === 0) return;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.filteredOrders.map(o => ({
        'Order ID': o.Id,
        'Table': o.TableId,
        'Items': this.parseItems(o.Items)
          .map((it: any) => `${it.Name} (x${it.qty})`)
          .join(', '),
        'Total': this.getFinalTotal(o),
        'Status': o.Status,
        'Date': new Date(o.CreatedAt).toLocaleDateString()
      }))
    );

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OrdersHistory');
    XLSX.writeFile(wb, 'orders_history.xlsx');
  }
}

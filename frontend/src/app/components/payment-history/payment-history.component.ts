import { Component, OnInit } from '@angular/core';
import { Payment, PaymentService } from '../../services/payment.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare module 'file-saver';

@Component({
  selector: 'app-payment-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css'
})
export class PaymentHistoryComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  paginatedPayments: Payment[] = [];
  loading = true;

  // Totals
  totalAllPayments = 0;
  totalTodayPayments = 0;
  totalFiltered = 0;

  // Filters
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    const today = new Date();
    this.startDate = this.formatDate(today);
    this.endDate = this.formatDate(today);

    this.loadPayments();
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const dd = ('0' + d.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }

  loadPayments() {
    this.loading = true;
    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.calculateTotalAll();
        this.calculateTotalToday();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
        this.loading = false;
      }
    });
  }

  // Apply filters when user clicks "Apply"
  applyFilters() {
  const start = this.startDate ? new Date(this.startDate) : null;
  const end = this.endDate ? new Date(this.endDate) : null;

  this.filteredPayments = this.payments.filter(p => {
    const collected = new Date(p.CollectedAt);
    let matchesDate = true;

    if (start) matchesDate = collected >= start;
    if (end) matchesDate = matchesDate && collected <= new Date(end.getTime() + 86399999);

    const matchesSearch =
      (p.OrderId ? p.OrderId.toString().toLowerCase() : '').includes(this.searchTerm.toLowerCase()) ||
      (p.CollectedBy ? p.CollectedBy.toString().toLowerCase() : '').includes(this.searchTerm.toLowerCase());

    return matchesSearch && matchesDate;
  });

  this.totalPages = Math.ceil(this.filteredPayments.length / this.itemsPerPage);
  this.currentPage = 1;
  this.updatePaginatedPayments();
  this.calculateTotalFiltered();
}

  calculateTotalAll() {
    this.totalAllPayments = this.payments.reduce((sum, p) => sum + p.Amount, 0);
  }

  calculateTotalToday() {
    const todayStr = this.formatDate(new Date());
    this.totalTodayPayments = this.payments
      .filter(p => this.formatDate(p.CollectedAt) === todayStr)
      .reduce((sum, p) => sum + p.Amount, 0);
  }

  calculateTotalFiltered() {
    this.totalFiltered = this.filteredPayments.reduce((sum, p) => sum + p.Amount, 0);
  }

  // Pagination
  updatePaginatedPayments() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPayments = this.filteredPayments.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedPayments();
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredPayments);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'payment_history.xlsx');
  }
}
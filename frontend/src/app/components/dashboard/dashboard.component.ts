import { Component, OnInit } from '@angular/core';
import { DashboardData, DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = false;

  // ✅ Date filter properties
  fromDate: string | null = null;
  toDate: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  /** 
   * ✅ Fetch dashboard data from API with optional date filter
   */
  fetchDashboard() {
    this.loading = true;
    this.dashboardService.getDashboard(this.fromDate, this.toDate).subscribe({
      next: (res) => {
        console.log('Dashboard API response:', res);
        this.dashboardData = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard API error:', err);
        this.loading = false;
        alert('Failed to load dashboard data');
      }
    });
  }

  /** 
   * ✅ Triggered when user changes date inputs
   */
  onDateChange() {
    this.fetchDashboard();
  }

  /** 
   * ✅ Reset date filter and reload dashboard
   */
  clearDateFilter() {
    this.fromDate = null;
    this.toDate = null;
    this.fetchDashboard();
  }
}

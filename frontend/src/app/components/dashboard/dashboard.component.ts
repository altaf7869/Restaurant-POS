import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { DashboardData, DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var CanvasJS: any;

@Component({
  selector: 'app-dashboard',
  imports:[CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewChecked {
 dashboardData: DashboardData | null = null;
  loading = false;

  fromDate: string | null = null;
  toDate: string | null = null;

  private chartsRendered = false; // ✅ prevent multiple renders

  @ViewChild('salesChartContainer') salesChartRef!: ElementRef;
  @ViewChild('ordersChartContainer') ordersChartRef!: ElementRef;
  @ViewChild('pendingChartContainer') pendingChartRef!: ElementRef;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  ngAfterViewChecked(): void {
    // Render charts only once, after view and dashboardData exist
    if (this.dashboardData && !this.chartsRendered
        && this.salesChartRef && this.ordersChartRef && this.pendingChartRef) {
      this.renderCharts();
      this.chartsRendered = true;
    }
  }

  fetchDashboard() {
    this.loading = true;
    this.chartsRendered = false; // reset on new data
    this.dashboardService.getDashboard(this.fromDate, this.toDate).subscribe({
      next: (res) => {
        this.dashboardData = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // fallback demo data
        this.dashboardData = { dateRange: null, totalOrders: 50, totalSales: 50000, pendingOrders: 5, popularItems: [] };
      }
    });
  }

  renderCharts() {
    if (!this.dashboardData) return;

    new CanvasJS.Chart(this.salesChartRef.nativeElement, {
      animationEnabled: true,
      backgroundColor: "transparent",
      axisX: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      axisY: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      toolTip: { enabled: false },
      data: [{
        type: "splineArea",
        color: "rgba(255,255,255,0.6)",
        markerSize: 0,
        dataPoints: [
          { y: this.dashboardData.totalSales },
          { y: this.dashboardData.totalSales * 0.8 },
          { y: this.dashboardData.totalSales * 1.2 },
          { y: this.dashboardData.totalSales * 0.9 },
          { y: this.dashboardData.totalSales * 1.1 }
        ]
      }]
    }).render();

    new CanvasJS.Chart(this.ordersChartRef.nativeElement, {
      animationEnabled: true,
      backgroundColor: "transparent",
      axisX: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      axisY: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      toolTip: { enabled: false },
      data: [{
        type: "splineArea",
        color: "#99bbff",
        markerSize: 0,
        dataPoints: [
          { y: this.dashboardData.totalOrders },
          { y: this.dashboardData.totalOrders * 0.6 },
          { y: this.dashboardData.totalOrders * 1.1 },
          { y: this.dashboardData.totalOrders * 0.9 },
          { y: this.dashboardData.totalOrders * 1.3 }
        ]
      }]
    }).render();

    new CanvasJS.Chart(this.pendingChartRef.nativeElement, {
      animationEnabled: true,
      backgroundColor: "transparent",
      axisX: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      axisY: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      toolTip: { enabled: false },
      data: [{
        type: "splineArea",
        color: "rgba(255,193,7,0.8)",
        markerSize: 0,
        dataPoints: [
          { y: this.dashboardData.pendingOrders },
          { y: this.dashboardData.pendingOrders * 1.2 },
          { y: this.dashboardData.pendingOrders * 0.8 },
          { y: this.dashboardData.pendingOrders * 1.1 },
          { y: this.dashboardData.pendingOrders * 0.9 }
        ]
      }]
    }).render();
  }

  onDateChange() { this.fetchDashboard(); }
  clearDateFilter() { this.fromDate = this.toDate = null; this.fetchDashboard(); }
}
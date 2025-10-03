import { Component, OnInit } from '@angular/core';
import { DashboardData, DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-dashboard',
    imports: [CommonModule, FormsModule, CanvasJSAngularChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboardData: DashboardData | null = null;
  loading = false;

  fromDate: string | null = null;
  toDate: string | null = null;

  // Chart option objects
  totalOrdersChartOptions: any = {};
  totalSalesChartOptions: any = {};
  pendingOrdersChartOptions: any = {};
  trafficChartOptions: any = {};

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard() {
    this.loading = true;
    this.dashboardService.getDashboard(this.fromDate, this.toDate).subscribe({
      next: (res) => {
        this.dashboardData = res;
        this.loading = false;
        this.setupMiniCharts();
        this.setupTrafficChart();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  setupMiniCharts() {
    if (!this.dashboardData) return;

    // Total Orders Mini Chart
    this.totalOrdersChartOptions = {
      height: 100,
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
    };

    // Total Sales Mini Chart
    this.totalSalesChartOptions = {
       // <- explicitly define height
 height: 100,
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
    };

    // Pending Orders Mini Chart
    this.pendingOrdersChartOptions = {
       height: 100,
      animationEnabled: true,
      backgroundColor: "transparent",
      axisX: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      axisY: { lineThickness: 0, tickThickness: 0, labelFormatter: () => "" },
      toolTip: { enabled: false },
      data: [{
        type: "column",
        color: "rgba(60, 70, 65, 0.8)",
        markerSize: 0,
        dataPoints: [
          { y: this.dashboardData.pendingOrders },
          { y: this.dashboardData.pendingOrders * 1.2 },
          { y: this.dashboardData.pendingOrders * 0.8 },
          { y: this.dashboardData.pendingOrders * 1.1 },
          { y: this.dashboardData.pendingOrders * 0.9 }
        ]
      }]
    };
  }

  setupTrafficChart() {
    if (!this.dashboardData?.traffic?.length) return;

    this.trafficChartOptions = {
      animationEnabled: true,
      theme: "light2",
      title: { text: "Orders Traffic" },
      axisX: { valueFormatString: "DD MMM", crosshair: { enabled: true, snapToDataPoint: true } },
      axisY: { title: "Count", crosshair: { enabled: true } },
      toolTip: { shared: true },
      legend: {
        cursor: "pointer",
        verticalAlign: "bottom",
        horizontalAlign: "right",
        dockInsidePlotArea: true,
        itemclick: function(e: any) {
          e.dataSeries.visible = !e.dataSeries.visible;
          e.chart.render();
        }
      },
      data: [
        {
          type: "line",
          showInLegend: true,
          name: "Total Orders",
          lineDashType: "dash",
          markerType: "square",
          dataPoints: this.dashboardData.traffic.map(t => ({
            x: new Date(t.OrderDate),
            y: t.TotalOrders
          }))
        },
        {
          type: "line",
          showInLegend: true,
          name: "Unique Tables",
          lineDashType: "dot",
          dataPoints: this.dashboardData.traffic.map(t => ({
            x: new Date(t.OrderDate),
            y: t.UniqueTables
          }))
        }
      ]
    };
  }

  onDateChange() { this.fetchDashboard(); }
  clearDateFilter() { this.fromDate = this.toDate = null; this.fetchDashboard(); }

}

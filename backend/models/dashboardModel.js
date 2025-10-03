// models/dashboardModel.js
const { getPool, sql } = require('../config/db');

async function getDashboardData(fromDate, toDate) {
  const pool = await getPool();

  // Prepare date condition
  const dateCondition = fromDate && toDate ? 'WHERE o.CreatedAt BETWEEN @fromDate AND @toDate' : '';

  // 1️⃣ Total Orders & Sales
  const totalOrdersRequest = pool.request();
  if (fromDate && toDate) {
    totalOrdersRequest.input('fromDate', sql.DateTime, new Date(fromDate));
    totalOrdersRequest.input('toDate', sql.DateTime, new Date(toDate));
  }
  const totalOrdersQuery = `
    SELECT 
      COUNT(Id) AS TotalOrders, 
      ISNULL(SUM(Total), 0) AS TotalSales
    FROM Orders o
    ${dateCondition};
  `;

  // 2️⃣ Pending Orders
  const pendingOrdersRequest = pool.request();
  if (fromDate && toDate) {
    pendingOrdersRequest.input('fromDate', sql.DateTime, new Date(fromDate));
    pendingOrdersRequest.input('toDate', sql.DateTime, new Date(toDate));
  }
  const pendingOrdersQuery = `
    SELECT COUNT(Id) AS PendingOrders
    FROM Orders o
    WHERE Status = 'pending'
    ${fromDate && toDate ? 'AND CreatedAt BETWEEN @fromDate AND @toDate' : ''};
  `;

  // 3️⃣ Popular Items (from MenuItems + OrderItems)
  const popularItemsRequest = pool.request();
  const popularItemsQuery = `
    SELECT TOP 10
        m.Id AS MenuItemId,
        m.Name,
        ISNULL(SUM(oi.qty), 0) AS TotalQty,
        ISNULL(SUM(oi.qty * oi.Price), 0) AS TotalSales
    FROM MenuItems m
    LEFT JOIN OrderItems oi 
        ON oi.MenuItemId = m.Id
    LEFT JOIN Orders o 
        ON o.Id = oi.OrderId AND o.Status = 'paid'
    GROUP BY m.Id, m.Name
    ORDER BY TotalQty DESC;
  `;

  // 4️⃣ Traffic Data (Orders per Day + Unique Tables)
  const trafficRequest = pool.request();
  if (fromDate && toDate) {
    trafficRequest.input('fromDate', sql.DateTime, new Date(fromDate));
    trafficRequest.input('toDate', sql.DateTime, new Date(toDate));
  }
  const trafficQuery = `
    SELECT 
      CAST(o.CreatedAt AS DATE) AS OrderDate,
      COUNT(o.Id) AS TotalOrders,
      COUNT(DISTINCT o.TableId) AS UniqueTables
    FROM Orders o
    ${dateCondition}
    GROUP BY CAST(o.CreatedAt AS DATE)
    ORDER BY OrderDate ASC;
  `;

  // Run queries concurrently
  const [ordersResult, pendingResult, popularResult, trafficResult] = await Promise.all([
    totalOrdersRequest.query(totalOrdersQuery),
    pendingOrdersRequest.query(pendingOrdersQuery),
    popularItemsRequest.query(popularItemsQuery),
    trafficRequest.query(trafficQuery)
  ]);

  return {
    totalOrders: ordersResult.recordset[0]?.TotalOrders || 0,
    totalSales: ordersResult.recordset[0]?.TotalSales || 0,
    pendingOrders: pendingResult.recordset[0]?.PendingOrders || 0,
    popularItems: popularResult.recordset || [],
    traffic: trafficResult.recordset || []
  };
}

module.exports = { getDashboardData };

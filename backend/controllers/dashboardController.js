// controllers/dashboardController.js
const DashboardModel = require('../models/dashboardModel');

exports.getDashboard = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const data = await DashboardModel.getDashboardData(fromDate, toDate);

    res.json({
      dateRange: fromDate && toDate ? { fromDate, toDate } : null,
      ...data
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

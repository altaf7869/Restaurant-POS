const orderModel = require('../models/orderModel');
const { generateOrderHtml } = require('../utils/orderTemplate');
const { generateOrderPdf } = require("../utils/pdfGenerator");
const { generateKitchenHtml } = require('../utils/kitchenTemplate'); // new utility for kitchen slip
const axios = require("axios");

/**
 * Create a new order
 */
async function createOrder(req, res) {
  try {
    const orderData = req.body;
    if (!orderData) return res.status(400).json({ message: 'Order data required' });

    const newOrder = await orderModel.create(orderData);

    // Emit socket event
    req.app.get('io').emit('orderCreated', newOrder);
    res.json(newOrder);
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get all pending orders
 */
async function getPendingOrders(req, res) {
  try {
    const orders = await orderModel.getPending();
    res.json(orders);
  } catch (err) {
    console.error("Get Pending Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get order by ID
 */
async function getOrderById(req, res) {
  try {
    const order = await orderModel.getById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error("Get Order By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update order (full update)
 */
async function updateOrder(req, res) {
  try {
    const updated = await orderModel.update(req.params.id, req.body);
    req.app.get('io').emit('orderUpdated', updated);
    res.json(updated);
  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Mark order as paid
 */
async function markPaid(req, res) {
  try {
    const updatedOrder = await orderModel.updateStatus(req.params.id, 'paid');
    req.app.get('io').emit('orderUpdated', updatedOrder);
    res.json(updatedOrder);
  } catch (err) {
    console.error("Mark Paid Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete order
 */
async function deleteOrder(req, res) {
  try {
    await orderModel.deleteOrder(req.params.id);
    req.app.get('io').emit('orderDeleted', { id: req.params.id });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Print order (HTML or PDF)
 */
async function printOrder(req, res) {
  try {
    const order = await orderModel.getById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.query.format === "pdf") {
      const pdfBuffer = await generateOrderPdf(order);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=order-${order.Id}.pdf`);
      return res.send(pdfBuffer);
    }

    const html = generateOrderHtml(order);
    res.send(html);
  } catch (err) {
    console.error("Print Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Kitchen print (for waiter to send order to kitchen)
 */
async function kitchenPrint(req, res) {
  try {
    const { tableNumber, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items to print" });
    }

    const html = generateKitchenHtml(tableNumber, items);
    res.send(html);
  } catch (err) {
    console.error("Kitchen Print Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Share order via WhatsApp Cloud API
 */
async function shareOrder(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number required" });

    const order = await orderModel.getById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const pdfBuffer = await generateOrderPdf(order);

    // TODO: Upload PDF to a public URL or WhatsApp Cloud API media upload
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "document",
        document: {
          filename: `order-${order.Id}.pdf`,
          caption: `Your Bill #${order.Id}`,
          link: `http://localhost:3000/order-pdfs/order-${order.Id}.pdf`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    );

    res.json({ message: "Order shared on WhatsApp!" });
  } catch (err) {
    console.error("Share Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createOrder,
  getPendingOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  printOrder,
  markPaid,
  kitchenPrint,  // added
  shareOrder,
};

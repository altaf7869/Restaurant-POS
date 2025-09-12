const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // optional
const {
  createOrder,
  getPendingOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  printOrder,
  markPaid,
  kitchenPrint,
  shareOrder
} = require('../controllers/orderController');

// Protected routes (require auth)
router.post('/', auth, createOrder);            // create order
router.get('/pending', auth, getPendingOrders); // get pending orders for cashier
router.get('/:id', auth, getOrderById);         // get single order
router.put('/:id', auth, updateOrder);          // update order (modify items / status)
router.delete('/:id', auth, deleteOrder);       // cancel/delete order
router.post('/:id/print', auth, printOrder);    // generate/return printable bill (PDF or HTML)
router.put('/:id/mark-paid', auth, markPaid);
router.post('/kitchen-print', auth, kitchenPrint);
router.post('/:id/share', auth, shareOrder);

module.exports = router;

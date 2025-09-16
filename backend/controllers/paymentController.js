// controllers/payment.controller.js
const Payment = require('../models/paymentModel');

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.getPymentHistory();
        res.status(200).json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllPayments
};

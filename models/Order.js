const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    payment: { type: String, required: true },

    items: [
        {
            title: String,
            price: Number,
            quantity: { type: Number, default: 1 }
        }
    ],

    totalAmount: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
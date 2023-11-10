const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema(
    {
        orderDate: {type: Date, required: true},
        deliveryDate: {type: Date, required: true},
        customerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'customers',
            required: true
        },
        menuItemID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'menuItems',
            required: true
        },
        orderQty : {type: String , required: true},
        orderAmount : {type: String , required: true},
        paymentOption: {type: String, required: true},
        remarks: {type: String},
        dcFlag: {type: String}

    },
    { timestamps: true }
);

Order.pre('find', function() {
    this.populate('menuItemID').populate('customerID');
  });


module.exports = mongoose.model('orders', Order);
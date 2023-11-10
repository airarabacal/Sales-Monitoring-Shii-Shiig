const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Customer = new Schema(
    {
        customerName: { type: String, required: true },        
        mobileNo: { type: String, required: true },
        address: { type: String, required: true }        
    },
    { timestamps: true }
);

module.exports = mongoose.model('customers', Customer);
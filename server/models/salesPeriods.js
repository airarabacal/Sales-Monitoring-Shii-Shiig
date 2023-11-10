const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalesPeriod = new Schema(
    {
        startDate: {type: Date, required: true},
        endDate: {type: Date, required: true},             
        sales: {type: String},   
        expenses: {type: String},   
        profit: {type: String},  
        startAmount: {type: String},  
        endAmount: {type: String},
        cashOnHand: {type: String},
        payables: {type: String},
        variance: {type: String},
        operatingCash: {type: String}
    },
    { timestamps: true }
);


module.exports = mongoose.model('salesPeriods', SalesPeriod);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Expense = new Schema(
    {
        expenseDate: {type: Date, required: true},
        expenseItem: { type: String, required: true },        
        expenseType: { type: String, required: true },
        cost: { type: String , required: true }        
    },
    { timestamps: true }
);

module.exports = mongoose.model('expenseItems', Expense);
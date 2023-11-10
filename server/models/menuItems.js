const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Menu = new Schema(
    {
        menuItem: { type: String, required: true },        
        menuItemName: { type: String, required: true },
        price: { type: String , required: true }        
    },
    { timestamps: true }
);

module.exports = mongoose.model('menuItems', Menu);
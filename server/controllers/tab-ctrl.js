const Customer = require('../models/customers');
const Menu = require('../models/menuItems');
const Expense = require('../models/expenseItems');
const Order = require('../models/orders');
const SalesPeriod = require('../models/salesPeriods');

const getModel = (doc, data) => {
    let model = null;

    switch (doc) {
        case "customers":
            if (!data) {
                model = Customer;
            } else {
                model = new Customer(data);
            }

            break;

        case "menuItems":
            if (!data) {
                model = Menu;
            } else {
                model = new Menu(data);
            }

            break;

        case "expenseItems":
            if (!data) {
                model = Expense;
            } else {
                model = new Expense(data);
            }

            break;

        case "orders":
            if (!data) {
                model = Order;
            } else {
                model = new Order(data);
            }

            break;

        case "salesPeriods":
            if (!data) {
                model = SalesPeriod;
            } else {
                model = new SalesPeriod(data);
            }

            break;
    }

    return model;
}


createRecord = (req, res) => {
    const body = req.body;
    const { docData, doc } = req.body.data;
    const docModel = getModel(doc, docData);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: err,
        })
    }

    if (!docModel) {
        return res.status(400).json({ success: false, error: err })
    }

    docModel
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: docModel._id,
                message: 'Record created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Record not created!',
            })
        });
}

updateRecord = async (req, res) => {
    const body = req.body;
    const { docData, doc } = req.body.data;
    const docModel = getModel(doc);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: err,
        })
    }

    docModel.findByIdAndUpdate({ _id: req.params.id }, docData, (err, record) => {
        if (err) {
            return res.status(404).json({
                err,
                message: 'Record not found!',
            })
        }

        if (record) {
            return res.status(200).json({
                success: true,
                id: record._id,
                message: 'Record updated!',
            })
        } else {
            return res.status(404).json({
                error,
                message: 'Record not updated!',
            })
        }


    });

}

deleteRecord = async (req, res) => {
    const { doc } = req.body.data;
    const docModel = getModel(doc);

    await docModel.findOneAndDelete({ _id: req.params.id }, (err, record) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!record) {
            return res
                .status(404)
                .json({ success: false, error: `Record not found` })
        }

        return res.status(200).json({ success: true, data: record })
    }).catch(err => console.log(err))
}

getAllRecords = async (req, res) => {
    const { doc } = req.body.data;
    const docModel = getModel(doc);

    await docModel.find({}, (err, records) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!records.length) {
            return res
                .status(404)
                .json({ success: false, error: `Records not found` })
        }


        return res.status(200).json({ success: true, data: records })
    }).catch(err => console.log(err));

}

getOrdersByCustomerIDAndDate = async (req, res) => {

    let dateStr = req.params.date.split('T')[0];

    await Order.find({
        customerID: req.params.id,
        orderDate: {
            $gte: new Date(new Date(dateStr).setHours(00, 00, 00)),
            $lte: new Date(new Date(dateStr).setHours(23, 59, 59))
        }
    }, (err, records) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!records.length) {
            return res
                .status(404)
                .json({ success: false, error: `Records not found` })
        }


        return res.status(200).json({ success: true, data: records })
    }).catch(err => console.log(err));

}

getOrdersByDate = (req, res) => {

    const startDateStr = req.params.startDate.split('T')[0];
    const endDateStr = req.params.endDate.split('T')[0];

    Order.find({
        orderDate: {
            $gte: new Date(new Date(startDateStr).setHours(00, 00, 00)),
            $lte: new Date(new Date(endDateStr).setHours(23, 59, 59))
        }
    }, (err, records) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!records.length) {
            return res
                .status(404)
                .json({ success: false, error: `Records not found` })
        }


        return res.status(200).json({ success: true, data: records })
    }).catch(err => console.log(err));

}

getExpensesByDate = (req, res) => {

    const startDateStr = req.params.startDate.split('T')[0];
    const endDateStr = req.params.endDate.split('T')[0];

    Expense.find({
        expenseDate: {
            $gte: new Date(new Date(startDateStr).setHours(00, 00, 00)),
            $lte: new Date(new Date(endDateStr).setHours(23, 59, 59))
        }
    }, (err, records) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!records.length) {
            return res
                .status(404)
                .json({ success: false, error: `Records not found` })
        }


        return res.status(200).json({ success: true, data: records })
    }).catch(err => console.log(err));

}

module.exports = {
    createRecord,
    updateRecord,
    deleteRecord,
    getAllRecords,
    getOrdersByCustomerIDAndDate,
    getOrdersByDate,
    getExpensesByDate
}

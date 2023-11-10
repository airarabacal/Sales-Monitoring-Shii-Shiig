const express = require('express');

const tabController = require('../controllers/tab-ctrl');

const router = express.Router();

//Customer tab routes
router.post('/customer', tabController.createRecord);
router.put('/customer/:id', tabController.updateRecord);
router.post('/customer/:id', tabController.deleteRecord);
router.post('/customers', tabController.getAllRecords);

//Menu tab routes
router.post('/menu', tabController.createRecord);
router.put('/menu/:id', tabController.updateRecord);
router.post('/menu/:id', tabController.deleteRecord);
router.post('/menus', tabController.getAllRecords);

//Expense tab routes
router.post('/expense', tabController.createRecord);
router.put('/expense/:id', tabController.updateRecord);
router.post('/expense/:id', tabController.deleteRecord);
router.post('/expenses', tabController.getAllRecords);
router.post('/expense/date/:startDate&:endDate', tabController.getExpensesByDate);

//Order tab routes
router.post('/order', tabController.createRecord);
router.put('/order/:id', tabController.updateRecord);
router.post('/order/:id', tabController.deleteRecord);
router.post('/orders', tabController.getAllRecords);
router.post('/order/customer/:id/:date', tabController.getOrdersByCustomerIDAndDate);
router.post('/order/date/:startDate&:endDate', tabController.getOrdersByDate);

//Sales Period tab routes
router.post('/salesPeriod', tabController.createRecord);
router.put('/salesPeriod/:id', tabController.updateRecord);
router.post('/salesPeriod/:id', tabController.deleteRecord);
router.post('/salesPeriods', tabController.getAllRecords);

module.exports = router;

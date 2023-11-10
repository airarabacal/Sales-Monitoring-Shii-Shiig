import React, { useState, useEffect, useRef, Fragment } from 'react';
import apis from '../Api';
import tableIcons from "./TableIcons";
import MaterialTable, { MTableAction, MTableBody, MTableActions } from 'material-table';
import Alert from '@material-ui/lab/Alert';

import { MenuItem, Select, TextField, Button, IconButton, InputLabel, TableFooter, TableRow, TableCell, FormControl, Box, Checkbox, FormControlLabel } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';

import ClearIcon from '@material-ui/icons/Clear';
import EventIcon from '@material-ui/icons/Event';

function OrderTabComponent() {

    const tableRef = useRef();
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedHeaderRow, setSelectedHeaderRow] = useState(null);
    const [selectedCustomerID, setCustomerID] = useState(null);
    const [selectedCustomer, setCustomer] = useState("");
    const [selectedPayOpt, setPaymentOpt] = useState("");
    const [remarks, setRemarks] = useState("");
    const [dcFlag, setDCFlag] = useState(false);
    const [customers, setCustomers] = useState([]); //customers data/
    const [orders, setOrders] = useState([]);
    const [menuItems, getMenuItems] = useState([{}]);
    const [totalAmount, setTotalAmount] = useState("0.00");
    const [orderList, setOrderList] = useState([]);
    const [orderDate, setOrderDate] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState(null);
    //for error handling
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])
    const [openOrderDate, setOpenOrderDate] = useState(false);
    const [openDeliveryDate, setOpenDeliveryDate] = useState(false);

    var numeral = require('numeral');

    useEffect(() => {
        apis.getAllRecords("/menus", "menuItems")
            .then(res => {
                getMenuItems(res.data.data)
            })
            .catch(error => {
                getMenuItems([{}]);
            })

    }, []);

    useEffect(() => {
        apis.getAllRecords("/customers", "customers")
            .then(res => {
                setCustomers(res.data.data)
            })
            .catch(error => {
                setCustomers([]);
            })
    }, []);

    useEffect(() => {
        apis.getAllRecords("/orders", "orders")
            .then(res => {
                if (res.data.data.length > 0) {
                    res.data.data.forEach((x) => {
                        if (x.menuItemID) {
                            x.menuItem = x.menuItemID.menuItem;
                            x.menuItemName = x.menuItemID.menuItemName;
                            x.customerName = x.customerID.customerName;
                            x.price = x.menuItemID.price;
                        }
                    })
                }

                setOrderList(res.data.data)
            })
            .catch(error => {
                setOrderList([]);
            })

    }, [orders]);

    useEffect(() => {
        if (selectedCustomerID && selectedCustomerID !== "0" && orderDate) {
            apis.getOrdersByCustomerIDAndDate("/order/customer/" + selectedCustomerID + "/" + orderDate.toISOString())
                .then(res => {


                    if (res.data.data.length > 0) {
                        res.data.data.forEach((x) => {
                            if (x.menuItemID) {
                                x.menuItem = x.menuItemID.menuItem;
                                x.menuItemName = x.menuItemID.menuItemName;
                                x.price = x.menuItemID.price;

                                setPaymentOpt(x.paymentOption);
                                setDCFlag(x.dcFlag);
                                setRemarks(x.remarks);
                                setDeliveryDate(x.deliveryDate);
                            }
                        })
                    }

                    setOrders(res.data.data)
                    computeTotalAmount();
                })
                .catch(error => {
                    setOrders([]);
                })
        } else {
            setOrders([]);
            setTotalAmount("0.00");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCustomerID, orderDate]);

    const FilterDatePicker = (props) => {
        const [date, setDate] = useState(null);
        const [openCustom, setOpenCustom] = useState(false);

        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    style={{ width: "150px" }}
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id={props.id}
                    value={date}
                    autoOk={true}
                    placeholder={"00/00/0000"}
                    open={openCustom}
                    onClose={() => {
                        setOpenCustom(false);
                    }}
                    onChange={(event) => {
                        setDate(event);
                        props.onFilterChanged(props.columnDef.tableData.id, event);
                    }}
                    InputProps={{
                        endAdornment: (
                            <React.Fragment>
                                <IconButton
                                    onClick={() => setDate(null)}
                                    style={{ margin: "-0.5em" }}
                                >
                                    <ClearIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => setOpenCustom(true)}
                                    style={{ margin: "-0.25em" }}
                                >
                                    <EventIcon />
                                </IconButton>
                            </React.Fragment>
                        )
                    }}
                    InputAdornmentProps={{
                        position: "start",
                        style: {
                            display: "none"
                        }
                    }}
                />
            </MuiPickersUtilsProvider>
        );
    };


    var orderListColumns = [
        { title: "id", field: "_id", hidden: true },
        {
            title: "Order Date", field: "orderDate", type: "date",
            filterComponent: (props) => <FilterDatePicker {...props} id="date-picker-orderDate-filter" />
        },
        {
            title: "Delivery Date", field: "deliveryDate", type: "date",
            filterComponent: (props) => <FilterDatePicker {...props} id="date-picker-deliveryDate-filter" />
        },
        { title: "Customer Name", field: "customerName" },
        { title: "Menu Item", field: "menuItem" },
        { title: "Menu Item Name", field: "menuItemName" },
        {
            title: "Order Quantity", field: "orderQty", filtering: false,
            render: rowData => <NumberFormat defaultValue={"0.00"} value={rowData.orderQty} displayType={'text'} thousandSeparator={true}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
        },
        {
            title: "Price", field: "price", filtering: false,
            render: rowData => <NumberFormat value={rowData.price} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
        },
        {
            title: "Amount", field: "orderAmount", filtering: false,
            render: rowData => <NumberFormat value={rowData.orderAmount} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
        },
        { title: "Payment Option", field: "paymentOption", lookup: { G: "GCASH", C: "Cash", BT: "Bank Transfer" } },
        {
            title: "DC?", field: "dcFlag", filtering: false,
            render: rowData => <Checkbox disabled checked={rowData.dcFlag === "true"} />
        },
        { title: "Remarks", field: "remarks", filtering: false }


    ]



    var orderColumns = [
        { title: "id", field: "_id", hidden: true },
        {
            title: "Order Date", field: "orderDate", type: "date", hidden: true
        },
        {
            title: "Delivery Date", field: "deliveryDate", type: "date", hidden: true
        },
        { title: "menuItemID", field: "menuItemID", hidden: true },
        {
            title: "Menu Item", field: "menuItem",
            editComponent: ({ value, onRowDataChange, rowData }) => (
                <Select
                    style={{ width: "150px" }}
                    labelId="menuItem"
                    id="menuItem"
                    value={value}
                    onChange={(event, child) => {
                        onRowDataChange({
                            ...rowData,
                            menuItemID: (child.props.id) ?? null,
                            menuItem: event.target.value,
                            menuItemName: (child.props.desc) ?? null,
                            price: (child.props.price)
                        });
                    }}
                >
                    {menuItems && menuItems.map((menuItem) => (
                        <MenuItem key={menuItem._id} id={menuItem._id} value={menuItem.menuItem} desc={menuItem.menuItemName} price={menuItem.price}>
                            {menuItem.menuItem}
                        </MenuItem>
                    ))}
                </Select>
            )
        },
        { title: "Menu Item Name", field: "menuItemName", editable: "never" },
        {
            title: "Order Quantity", field: "orderQty",
            render: rowData => <NumberFormat defaultValue={"0.00"} value={rowData.orderQty} displayType={'text'} thousandSeparator={true}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />,
            editComponent: ({ value, rowData, onRowDataChange }) => (
                <NumberFormat defaultValue={"0.00"} value={value} customInput={TextField} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true}
                    onValueChange={(values) => {

                        onRowDataChange({
                            ...rowData,
                            orderQty: (values.value) ?? null,
                            orderAmount: (numeral(values.value).value() * numeral(rowData.price).value()) ?? null
                        });


                    }}
                />
            )
        },
        {
            title: "Price", field: "price",
            render: rowData => <NumberFormat value={rowData.price} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={rowData.price} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.price = values.value;
                    }}
                />
            )
        },
        {
            title: "Amount", field: "orderAmount",
            render: rowData => <NumberFormat value={rowData.orderAmount} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={rowData.orderAmount} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.orderAmount = values.value;
                    }}
                />
            )

        }
    ]

    function modifyRecord(newData, oldData) {
        //validation
        let errorList = []
        if (newData.orderDate === "") {
            errorList.push("Please enter the Order Date.")
        }
        if (newData.menuItem === "") {
            errorList.push("Please enter a Menu Item.")
        }
        if (newData.orderQty === "") {
            errorList.push("Please enter the Order Quantity.")
        }

        if (errorList.length < 1) {
            apis.updateRecordById("/order/" + newData._id, newData, "orders")
                .then(res => {
                    const currentData = [...orders];
                    const index = oldData.tableData.id;
                    currentData[index] = newData;
                    setOrders(currentData);
                    setSelectedRow(newData.tableData.id)
                    computeTotalAmount(currentData);
                    setIserror(false)
                    setErrorMessages([])
                })
                .catch(error => {
                    setErrorMessages(["Update failed! Server error"])
                    setIserror(true)

                })
        } else {
            setErrorMessages(errorList)
            setIserror(true)

        }

    }

    function addRecord(newData) {
        //validation
        let errorList = []
        if (newData.orderDate === "") {
            errorList.push("Please enter the Order Date.")
        }
        if (newData.menuItem === "") {
            errorList.push("Please enter a Menu Item.")
        }
        if (newData.orderQty === "") {
            errorList.push("Please enter the Order Quantity.")
        }


        if (errorList.length < 1) { //no error
            apis.insertRecord("/order", newData, "orders")
                .then(res => {
                    const currentData = [...orders];
                    newData._id = res.data.id;
                    currentData.push(newData);
                    setOrders(currentData);
                    setSelectedRow(newData.tableData.id);
                    computeTotalAmount(currentData);
                    setErrorMessages([])
                    setIserror(false)
                })
                .catch(error => {
                    setErrorMessages(["Cannot add data. Server error!"])
                    setIserror(true)
                })
        } else {
            setErrorMessages(errorList)
            setIserror(true)
        }
    }

    function deleteRecord(oldData) {
        apis.deleteRecordById("/order/" + oldData._id, "orders")
            .then(res => {
                const currentData = [...orders];
                const index = oldData.tableData.id;
                currentData.splice(index, 1);
                setOrders(currentData);
                if (currentData.length > 0) {
                    setSelectedRow(currentData[0].tableData.id)
                }

                computeTotalAmount(currentData);

            })
            .catch(error => {
                setErrorMessages(["Delete failed! Server error"])
                setIserror(true)
            })
    }

    const handleAddRow = (e) => {
        tableRef.current.state.showAddRow = true;

        tableRef.current.dataManager.changeRowEditing();
        tableRef.current.setState({
            ...tableRef.current.dataManager.getRenderState(),
            showAddRow: true,
        });

    };

    const handleClear = (e) => {
        setOrderDate(null);
        setDeliveryDate(null);
        setCustomer("");
        setCustomerID(null);
        setPaymentOpt("");
        setRemarks("");
        setDCFlag(false);
    };


    const computeTotalAmount = (currentData) => {

        if (tableRef.current) {

            let data = tableRef.current.state.data;

            if (currentData) {
                data = currentData;
            }

            if (data) {
                let totalOrderAmount = data
                    .map(a => a.orderAmount)
                    .reduce((total, amount) => (total += numeral(amount).value()), 0);

                setTotalAmount(totalOrderAmount);

            }
        } else {
            setTotalAmount("0.00");
        }
    };

    const handleRemarksChange = (event) => {
        setRemarks(event.target.value);
    };


    const handleDCFlagChange = (event) => {
        setDCFlag(event.target.checked);
    };

    return (
        <div className="App" >
            <MaterialTable
                title="Order History"
                columns={orderListColumns}
                data={orderList}
                onRowClick={((evt, selectedRow) => {
                    setSelectedHeaderRow(selectedRow.tableData.id)
                    setOrderDate(new Date(selectedRow.orderDate));
                    setCustomer(selectedRow.customerName);
                    setCustomerID(selectedRow.customerID._id);

                })}
                options={{
                    search: false,
                    headerStyle: {
                        backgroundColor: '#536162',
                        color: '#FFF'
                    },
                    rowStyle: rowData => ({
                        backgroundColor: (selectedHeaderRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                    }),
                    filtering: true,
                    sorting: true
                }}
            />

            <br />
            <div>
                {iserror &&
                    <Alert severity="error">
                        {errorMessages.map((msg, i) => {
                            return <div key={i}>{msg}</div>
                        })}
                    </Alert>
                }
            </div>
            <MaterialTable
                tableRef={tableRef}
                title="Order Entry"
                columns={orderColumns}
                data={orders}
                icons={tableIcons}
                onRowClick={((evt, selectedRow) => {
                    setSelectedRow(selectedRow.tableData.id);
                })}
                onFilterChange={(filter) => computeTotalAmount()}
                options={{
                    search: false,
                    headerStyle: {
                        backgroundColor: '#536162',
                        color: '#FFF'
                    },
                    rowStyle: rowData => ({
                        backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                    }),
                    addRowPosition: "first",
                    sorting: true
                }}
                editable={{
                    onRowAdd: (newData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                newData.customerID = selectedCustomerID;
                                newData.orderDate = orderDate;
                                newData.deliveryDate = deliveryDate;
                                newData.paymentOption = selectedPayOpt;
                                newData.remarks = remarks;
                                newData.dcFlag = dcFlag;
                                addRecord(newData);
                                resolve();
                            }, 1000)
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                newData.paymentOption = selectedPayOpt;
                                newData.deliveryDate = deliveryDate;
                                newData.remarks = remarks;
                                newData.dcFlag = dcFlag;
                                modifyRecord(newData, oldData);
                                resolve();
                            }, 1000)
                        })
                    ,
                    onRowDelete: (oldData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                deleteRecord(oldData);
                                resolve();
                            }, 1500)
                        })

                }}
                components={{
                    Toolbar: props => (
                        <div>
                            {/* <MTableToolbar {...props} /> */}
                            <div style={{ padding: '20px 20px' }}>
                                <Box component="span" display="block" p={1} bgcolor="grey" border={1}
                                    borderColor="grey.500" borderRadius={5} flexDirection="row" alignItems="center">
                                    <FormControl style={{ paddingLeft: '20px', verticalAlign: "baseline" }}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                disableToolbar
                                                label="Order Date"
                                                variant="inline"
                                                format="MM/dd/yyyy"
                                                margin="dense"
                                                id="entry-date-picker-orderDate"
                                                value={!orderDate ? null : orderDate}
                                                style={{ width: "150px" }}
                                                open={openOrderDate}
                                                autoOk={true}
                                                placeholder={"00/00/0000"}
                                                onClose={() => {
                                                    setOpenOrderDate(false);
                                                }}
                                                onChange={setOrderDate}
                                                InputProps={{
                                                    endAdornment: (
                                                        <React.Fragment>
                                                            <IconButton
                                                                onClick={() => setOrderDate(null)}
                                                                style={{ margin: "-0.5em" }}
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => setOpenOrderDate(true)}
                                                                style={{ margin: "-0.25em" }}
                                                            >
                                                                <EventIcon />
                                                            </IconButton>
                                                        </React.Fragment>
                                                    )
                                                }}
                                                InputAdornmentProps={{
                                                    position: "start",
                                                    style: {
                                                        display: "none"
                                                    }
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </FormControl>

                                    <FormControl style={{ paddingLeft: '20px', verticalAlign: "baseline" }}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                disableToolbar
                                                label="Delivery Date"
                                                variant="inline"
                                                format="MM/dd/yyyy"
                                                margin="dense"
                                                id="entry-date-picker-deliveryDate"
                                                value={!deliveryDate ? null : deliveryDate}
                                                style={{ width: "150px" }}
                                                open={openDeliveryDate}
                                                autoOk={true}
                                                placeholder={"00/00/0000"}
                                                onClose={() => {
                                                    setOpenDeliveryDate(false);
                                                }}
                                                onChange={setDeliveryDate}
                                                InputProps={{
                                                    endAdornment: (
                                                        <React.Fragment>
                                                            <IconButton
                                                                onClick={() => setDeliveryDate(null)}
                                                                style={{ margin: "-0.5em" }}
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => setOpenDeliveryDate(true)}
                                                                style={{ margin: "-0.25em" }}
                                                            >
                                                                <EventIcon />
                                                            </IconButton>
                                                        </React.Fragment>
                                                    )
                                                }}
                                                InputAdornmentProps={{
                                                    position: "start",
                                                    style: {
                                                        display: "none"
                                                    }
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </FormControl>

                                    <FormControl style={{ paddingLeft: '50px', verticalAlign: "baseline" }}>
                                        <InputLabel id="customerLabel" style={{ paddingLeft: '50px' }}>Customer</InputLabel>
                                        <Select
                                            style={{ width: "200px" }}
                                            labelId="customerLabel"
                                            id="customer"
                                            value={selectedCustomer}
                                            onChange={(event, child) => {
                                                setTotalAmount("0.00");
                                                setCustomerID(child.props.id);
                                                setCustomer(event.target.value);
                                            }}
                                        >
                                            <MenuItem key="0" id="0" value=""> - </MenuItem>
                                            {customers && customers.map((customer) => (
                                                <MenuItem key={customer._id} id={customer._id} value={customer.customerName}>
                                                    {customer.customerName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl style={{ paddingLeft: '30px', verticalAlign: "baseline" }}>
                                        <InputLabel id="paymentLabel" style={{ paddingLeft: '30px' }}>Payment Option</InputLabel>
                                        <Select
                                            style={{ width: "200px" }}
                                            labelId="paymentLabel"
                                            id="paymentOption"
                                            value={selectedPayOpt}
                                            onChange={(event, child) => {
                                                setPaymentOpt(event.target.value);
                                            }}
                                        >
                                            <MenuItem key="1" id="gcash" value="G"> GCASH </MenuItem>
                                            <MenuItem key="2" id="cash" value="C"> Cash </MenuItem>
                                            <MenuItem key="3" id="bank-trn" value="BT"> Bank Transfer </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <div style={{
                                        padding: '20px 20px', display: "inline-block",
                                        fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"],
                                        fontSize: "1rem",
                                        fontWeight: "400"
                                    }}>
                                     <span> <Button variant="contained" onClick={handleClear}
                                            style={{
                                                backgroundColor: "#536162", color: "white"
                                            }}>
                                            Clear Details
                                        </Button></span>

                                        <span> <Button variant="contained" onClick={handleAddRow}
                                            style={{
                                                backgroundColor: "#536162", color: "white",
                                                opacity: (!selectedCustomerID || selectedCustomerID === "0" || !orderDate || !selectedPayOpt) && 0.6
                                            }}
                                            disabled={(!selectedCustomerID || selectedCustomerID === "0" || !orderDate || !selectedPayOpt)}>
                                            Create Order
                                        </Button></span>





                                    </div>

                                    <br />
                                    <FormControlLabel style={{ paddingLeft: '20px', verticalAlign: "baseline" }}
                                        control={<Checkbox color="default" checked={dcFlag} onChange={handleDCFlagChange} />}
                                        label="DC?"
                                    />
                                    <br />
                                    <FormControl style={{ paddingLeft: '20px', width: "500px", verticalAlign: "baseline" }}>
                                        <TextField id="standard-required" label="Remarks" value={remarks} onChange={handleRemarksChange}
                                            autoFocus={(selectedCustomerID && orderDate && selectedPayOpt)} />
                                    </FormControl>
                                </Box>

                            </div>

                        </div>
                    ),
                    Actions: (props, rowData) => {
                        return (
                            <MTableActions
                                {...props}


                            />
                        );
                    },
                    Action: (props) => {

                        if (
                            typeof props.action === typeof Function ||
                            props.action.tooltip !== "Add"
                        ) {

                            return <MTableAction {...props}


                            />;
                        } else {
                            return <div ref={tableRef} onClick={props.action.onClick} />;
                        }

                    },
                    Body: props => {

                        return (

                            <Fragment>
                                <MTableBody {...props} />

                                <TableFooter>
                                    <TableRow >
                                        <TableCell colSpan={5} align="right" size="medium"
                                            style={{ color: "inherit", fontFamily: "inherit", fontSize: "inherit" }}>
                                            Total Amount:
                                    </TableCell>
                                        <TableCell colSpan={1} size="medium"
                                            style={{ color: "inherit", fontFamily: "inherit", fontSize: "inherit" }}>

                                            <NumberFormat defaultValue={"0.00"} value={totalAmount} displayType={'text'} thousandSeparator={true}
                                                decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Fragment>

                        )
                    }
                }}
            />

        </div>
    );
}

export default OrderTabComponent;
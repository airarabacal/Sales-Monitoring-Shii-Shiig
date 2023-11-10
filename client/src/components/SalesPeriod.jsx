import React, { useState, useEffect, useRef } from 'react';
import apis from '../Api';
import tableIcons from "./TableIcons";
import MaterialTable from 'material-table';
import Alert from '@material-ui/lab/Alert';

import { TextField, Button, IconButton } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import NumberFormat from 'react-number-format';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';

import ClearIcon from '@material-ui/icons/Clear';
import EventIcon from '@material-ui/icons/Event';

function SalesPeriodComponent() {

    const tableRef = useRef();
    const [selectedRow, setSelectedRow] = useState(null);
    const [data, setData] = useState([]);
    const [totalSales, setTotalSales] = useState("0.00");
    const [totalExpense, setTotalExpense] = useState("0.00");
    const [profit, setProfit] = useState("0.00");
    //for error handling
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])

    var numeral = require('numeral');

    useEffect(() => {
        apis.getAllRecords("/salesPeriods", "salesPeriods")
            .then(res => {
                setData(res.data.data)
            })
            .catch(error => {
                setData([]);
            })


    }, []);

    useEffect(() => {
        const grossProfit = numeral(totalSales).value() - numeral(totalExpense).value();

        setProfit(grossProfit);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalExpense, totalSales]);


    const FilterDatePicker = (props) => {
        const [date, setDate] = useState(null);
        const [openCustom, setOpenCustom] = useState(false);

        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id={props.id}
                    value={date}
                    autoOk={true}
                    placeholder={"00/00/0000"}
                    style={{ width: "150px" }}
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

    const GridDatePicker = (props) => {
        const [date, setDate] = useState(null);
        const [openCustom, setOpenCustom] = useState(false);

        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id={props.id}
                    value={!props.value ? date : props.value}
                    autoOk={true}
                    placeholder={"00/00/0000"}
                    style={{ width: "150px" }}
                    open={openCustom}
                    onClose={() => {
                        setOpenCustom(false);
                    }}
                    onChange={(value) => {
                        setDate(value);

                        if (props.id === "date-picker-startDate") {
                            props.onRowDataChange({
                                ...props.rowData,
                                startDate: value
                            })

                            computeTotalSales(value, props.rowData.endDate);
                            computeTotalExpenses(value, props.rowData.endDate);
                        } else {
                            props.onRowDataChange({
                                ...props.rowData,
                                endDate: value
                            });

                            computeTotalSales(props.rowData.startDate, value);
                            computeTotalExpenses(props.rowData.startDate, value);

                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <React.Fragment>
                                <IconButton
                                    onClick={() => {
                                        setDate(null);
                                        if (props.id === "date-picker-startDate") {
                                            props.onRowDataChange({
                                                ...props.rowData,
                                                startDate: null
                                            })

                                            computeTotalSales(null, props.rowData.endDate);
                                            computeTotalExpenses(null, props.rowData.endDate);
                                        } else {
                                            props.onRowDataChange({
                                                ...props.rowData,
                                                endDate: null
                                            });

                                            computeTotalSales(props.rowData.startDate, null);
                                            computeTotalExpenses(props.rowData.startDate, null);

                                        }


                                    }}
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


    var salesPeriodColumns = [
        { title: "id", field: "_id", hidden: true },
        {
            title: "Start Date", field: "startDate", type: "date",
            editComponent: (props) => (
                <GridDatePicker {...props} id="date-picker-startDate" />                
            ),
            filterComponent: (props) => <FilterDatePicker {...props} id="date-picker-startDate-filter" />
        },
        {
            title: "End Date", field: "endDate", type: "date",
            editComponent: (props) => (
                <GridDatePicker {...props} id="date-picker-endDate" />
            ),
            filterComponent: (props) => <FilterDatePicker {...props} id="date-picker-endDate-filter" />
        },
        {
            title: "Sales", field: "sales", filtering: false,
            render: rowData => <NumberFormat value={rowData.sales} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={totalSales} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.sales = values.value;
                    }}
                />
            )
        },
        {
            title: "Expenses", field: "expenses", filtering: false,
            render: rowData => <NumberFormat value={rowData.expenses} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={totalExpense} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.expenses = values.value;
                    }}
                />
            )
        },
        {
            title: "Profit", field: "profit", filtering: false,
            render: rowData => <NumberFormat value={rowData.profit} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={profit} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.profit = values.value;
                    }}
                />
            )
        },
        {
            title: "Start Amount", field: "startAmount", filtering: false,
            render: rowData => <NumberFormat value={rowData.startAmount} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ value, rowData, onRowDataChange }) => (
                <NumberFormat defaultValue={"0.00"} value={value} customInput={TextField} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true}
                    onValueChange={(values) => {
                        onRowDataChange({
                            ...rowData,
                            startAmount: (values.value) ?? null,
                            sales: totalSales ?? null,
                            expenses: totalExpense ?? null,
                            profit: profit ?? null,
                            endAmount: numeral(values.value).value() + numeral(profit).value() ?? null,
                            variance: (numeral(rowData.cashOnHand).value() - (numeral(values.value).value() + numeral(profit).value())) ?? null

                        });

                    }}

                    InputProps={{
                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                />
            )
        },
        {
            title: "End Amount", field: "endAmount", filtering: false,
            render: rowData => <NumberFormat value={rowData.endAmount} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={rowData.endAmount} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.endAmount = values.value;
                    }}
                />
            )
        },
        {
            title: "Cash On-Hand", field: "cashOnHand", filtering: false,
            render: rowData => <NumberFormat defaultValue={"0.00"} value={rowData.cashOnHand} displayType={'text'} thousandSeparator={true}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />,
            editComponent: ({ value, rowData, onRowDataChange }) => (
                <NumberFormat defaultValue={"0.00"} value={value} customInput={TextField} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true}
                    onValueChange={(values) => {
                        onRowDataChange({
                            ...rowData,
                            cashOnHand: (values.value) ?? null,
                            sales: totalSales ?? null,
                            expenses: totalExpense ?? null,
                            profit: profit ?? null,
                            variance: (numeral(values.value).value() - numeral(rowData.endAmount).value()) ?? null,
                            operatingCash: (numeral(values.value).value() - numeral(rowData.payables).value()) ?? null
                        });
                    }}

                    InputProps={{
                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                />
            )
        },
        {
            title: "Payables", field: "payables", filtering: false,
            render: rowData => <NumberFormat defaultValue={"0.00"} value={rowData.payables} displayType={'text'} thousandSeparator={true}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />,
            editComponent: ({ value, rowData, onRowDataChange }) => (
                <NumberFormat defaultValue={"0.00"} value={value} customInput={TextField} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true}
                    onValueChange={(values) => {
                        onRowDataChange({
                            ...rowData,
                            payables: (values.value) ?? null,
                            operatingCash: (numeral(rowData.cashOnHand).value() - numeral(values.value).value()) ?? null
                        });
                    }}

                    InputProps={{
                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                />
            )
        },
        {
            title: "Variance", field: "variance", filtering: false,
            render: rowData => <NumberFormat value={rowData.variance} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={rowData.variance} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.variance = values.value;
                    }}
                />
            )
        },
        {
            title: "Operating Cash", field: "operatingCash", filtering: false,
            render: rowData => <NumberFormat value={rowData.operatingCash} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />
            ,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={rowData.operatingCash} displayType={'text'} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true} prefix={'₱'}
                    onValueChange={(values) => {
                        rowData.operatingCash = values.value;
                    }}
                />
            )
        }
    ]

    function modifyRecord(newData, oldData) {
        //validation
        let errorList = []
        if (newData.startDate === "") {
            errorList.push("Please enter the Start Date.")
        }
        if (newData.endDate === "") {
            errorList.push("Please enter the End Date.")
        }

        if (errorList.length < 1) {
            apis.updateRecordById("/salesPeriod/" + newData._id, newData, "salesPeriods")
                .then(res => {
                    const currentData = [...data];
                    const index = oldData.tableData.id;
                    currentData[index] = newData;
                    setData(currentData);
                    setSelectedRow(newData.tableData.id)
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
        if (newData.startDate === "") {
            errorList.push("Please enter the Start Date.")
        }
        if (newData.endDate === "") {
            errorList.push("Please enter the End Date.")
        }


        if (errorList.length < 1) { //no error
            apis.insertRecord("/salesPeriod", newData, "salesPeriods")
                .then(res => {
                    const currentData = [...data];
                    newData._id = res.data.id;
                    currentData.push(newData);
                    setData(currentData);
                    setSelectedRow(newData.tableData.id)
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
        apis.deleteRecordById("/salesPeriod/" + oldData._id, "salesPeriods")
            .then(res => {
                const currentData = [...data];
                const index = oldData.tableData.id;
                currentData.splice(index, 1);
                setData(currentData);
                if (currentData.length > 0) {
                    setSelectedRow(currentData[0].tableData.id)
                }

            })
            .catch(error => {
                setErrorMessages(["Delete failed! Server error"])
                setIserror(true)
            })
    }

    const computeTotalExpenses = (fromDate, toDate) => {

        let expenseAmount = numeral("0.00").value();
        if (fromDate && toDate) {


            apis.getExpensesByDate("/expense/date/" + fromDate.toISOString() + "&" + toDate.toISOString())
                .then(res => {

                    const expenses = res.data.data;
                    if (expenses) {

                        expenseAmount = expenses
                            .map(a => a.cost)
                            .reduce((total, amount) => (total += numeral(amount).value()), 0);

                    }
                    setTotalExpense(expenseAmount);
                })
                .catch(error => {
                    setTotalExpense(expenseAmount);
                })
        } else {
            setTotalExpense(expenseAmount);
        }


        setTotalExpense(expenseAmount);


    }


    const computeTotalSales = (fromDate, toDate) => {

        let salesAmount = numeral("0.00").value();

        if (fromDate && toDate) {

            apis.getOrdersByDate("/order/date/" + fromDate.toISOString() + "&" + toDate.toISOString())
                .then(res => {
                    const orders = res.data.data;

                    if (orders) {

                        salesAmount = orders
                            .map(a => a.orderAmount)
                            .reduce((total, amount) => (total += numeral(amount).value()), 0);

                    }

                    setTotalSales(salesAmount);

                })
                .catch(error => {
                    setTotalSales(salesAmount);
                })

        } else {
            setTotalSales(salesAmount);
        }

    };

    const handleAddRow = (e) => {
        tableRef.current.state.showAddRow = true;

        tableRef.current.dataManager.changeRowEditing();
        tableRef.current.setState({
            ...tableRef.current.dataManager.getRenderState(),
            showAddRow: true,
        });

    };

    return (
        <div className="App" >
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
                title=""
                columns={salesPeriodColumns}
                data={data}
                icons={tableIcons}
                onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                options={{
                    search: false,
                    headerStyle: {
                        backgroundColor: '#536162',
                        color: '#FFF'
                    },
                    rowStyle: rowData => ({
                        backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                    }),
                    filtering: true,
                    addRowPosition: "first",
                    sorting: true
                }}
                editable={{
                    onRowAdd: (newData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                addRecord(newData);
                                resolve();
                            }, 1000)
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
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
                            <div style={{
                                padding: '20px 20px', display: "inline-block",
                                fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"],
                                fontSize: "1rem",
                                fontWeight: "400"
                            }}>

                                <span> <Button variant="contained" onClick={handleAddRow} style={{backgroundColor:"#536162", color:"white"}}>
                                    Add Sales Period
                                        </Button></span>


                            </div>

                        </div>
                    )
                }}
            />

        </div>
    );
}

export default SalesPeriodComponent;
import React, { useState, useEffect, useRef } from 'react';
import MaterialTable from 'material-table';
import Alert from '@material-ui/lab/Alert';
import apis from '../Api';
import { TextField, Button, IconButton } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import tableIcons from "./TableIcons";
import NumberFormat from 'react-number-format';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';

import ClearIcon from '@material-ui/icons/Clear';
import EventIcon from '@material-ui/icons/Event';

function ExpenseTabComponent(props) {

    const tableRef = useRef();
    const [selectedRow, setSelectedRow] = useState(null);
    const [data, setData] = useState([]);

    //for error handling
    const [iserror, setIserror] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);

    useEffect(() => {
        apis.getAllRecords("/expenses", "expenseItems")
            .then(res => {
                setData(res.data.data)
            })
            .catch(error => {
                setData([]);
            })
    }, []);

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
                    id="date-picker-inline"
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

                        props.onRowDataChange({
                            ...props.rowData,
                            expenseDate: value
                        })

                    }}
                    InputProps={{
                        endAdornment: (
                            <React.Fragment>
                                <IconButton
                                    onClick={() => {
                                        setDate(null);
                                        props.onRowDataChange({
                                            ...props.rowData,
                                            expenseDate: null
                                        })



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


    var columns = [
        { title: "id", field: "_id", hidden: true },
        {
            title: "Expense Date", field: "expenseDate", type: "date",
            editComponent: (props) => (
                <GridDatePicker {...props} id="date-picker-expenseDate" />
            ),
            filterComponent: (props) => <FilterDatePicker {...props} id="date-picker-filter" />
        },
        {
            title: "Cost", field: "cost", filtering: false,
            render: rowData => <NumberFormat value={rowData.cost} displayType={'text'} thousandSeparator={true} prefix={'₱'}
                decimalScale={2} fixedDecimalScale={true} isNumericString={true} />,
            editComponent: ({ rowData }) => (
                <NumberFormat defaultValue={"0.00"} value={rowData.cost} customInput={TextField} thousandSeparator={true}
                    decimalScale={2} fixedDecimalScale={true} isNumericString={true}
                    onValueChange={(values) => {

                        rowData.cost = values.value;

                    }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                />
            )
        },
        { title: "Expense Item", field: "expenseItem" },
        {
            title: "Expense Type", field: "expenseType", lookup: { K: "Kitchen", M: "Others" }
        }

    ]

    function modifyRecord(newData, oldData) {
        //validation
        let errorList = []
        if (newData.expenseDate === "") {
            errorList.push("Please enter the Expense Date.")
        }
        if (newData.cost === "") {
            errorList.push("Please enter the Cost.")
        }
        if (newData.expenseItem === "") {
            errorList.push("Please enter the Expense Item.")
        }
        if (newData.expenseType === "") {
            errorList.push("Please enter the Expense Type.")
        }

        if (errorList.length < 1) {
            apis.updateRecordById("/expense/" + newData._id, newData, "expenseItems")
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
        if (newData.expenseDate === "") {
            errorList.push("Please enter the Expense Date.")
        }
        if (newData.cost === "") {
            errorList.push("Please enter the Cost.")
        }
        if (newData.expenseItem === "") {
            errorList.push("Please enter the Expense Item.")
        }
        if (newData.expenseType === "") {
            errorList.push("Please enter the Expense Type.")
        }


        if (errorList.length < 1) { //no error
            apis.insertRecord("/expense", newData, "expenseItems")
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
        apis.deleteRecordById("/expense/" + oldData._id, "expenseItems")
            .then(res => {
                const currentData = [...data];
                const index = oldData.tableData.id;
                currentData.splice(index, 1);
                setData(currentData);
                if (data.length > 0) {
                    setSelectedRow(data[0].tableData.id)
                }
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
                columns={columns}
                data={data}
                icons={tableIcons}
                editable={{
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                modifyRecord(newData, oldData);
                                resolve();
                            }, 1000)
                        })
                    ,
                    onRowAdd: (newData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                addRecord(newData);
                                resolve();
                            }, 1000)
                        }),
                    onRowDelete: (oldData) =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                deleteRecord(oldData);
                                resolve();
                            }, 1500)
                        })

                }}
                onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                options={{
                    headerStyle: {
                        backgroundColor: '#536162',
                        color: '#FFF'
                    },
                    rowStyle: rowData => ({
                        backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                    }),
                    search: false,
                    filtering: true,
                    addRowPosition: "first",
                    sorting: true
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
                                    Add Expense
                                        </Button></span>


                            </div>

                        </div>
                    )
                }}
            />

        </div>
    );
}

export default ExpenseTabComponent;
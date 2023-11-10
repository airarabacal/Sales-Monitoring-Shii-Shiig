import React, { useState, useEffect, useRef } from 'react';
import apis from '../Api';
import tableIcons from "./TableIcons";
import MaterialTable from 'material-table';
import Alert from '@material-ui/lab/Alert';
import { TextField, Button } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import NumberFormat from 'react-number-format';

function MenuTabComponent() {

  const tableRef = useRef();
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]); //table data

  //for error handling
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])

  useEffect(() => {
    apis.getAllRecords("/menus", "menuItems")
      .then(res => {
        setData(res.data.data)
      })
      .catch(error => {
        setData([]);
      })
  }, []);

  var columns = [
    { title: "id", field: "_id", hidden: true },
    {
      title: "Price", field: "price",filtering: false, headerStyle: { width: "10%", maxWidth: "10%" }, cellStyle: {
        width: "10%", maxWidth: "10%"
      },
      render: rowData => <NumberFormat value={rowData.price} displayType={'text'} thousandSeparator={true} prefix={'₱'}
        decimalScale={2} fixedDecimalScale={true} isNumericString={true} />,
      editComponent: ({ rowData }) => (
        <NumberFormat defaultValue={"0.00"} value={rowData.price} customInput={TextField} thousandSeparator={true}
          decimalScale={2} fixedDecimalScale={true} isNumericString={true}
          onValueChange={(values) => {

            rowData.price = values.value;

          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
          }}
        />
      )

    },
    { title: "Menu Item", field: "menuItem", headerStyle: { width: "20%", maxWidth: "20%" }, cellStyle: { width: "20%", maxWidth: "20%" } },
    { title: "Menu Item Name", field: "menuItemName", headerStyle: { width: "70%", maxWidth: "70%" }, cellStyle: { width: "70%", maxWidth: "70%" } }
  ]


  function modifyRecord(newData, oldData) {
    //validation
    let errorList = []
    if (newData.menuItem === "") {
      errorList.push("Please enter the Menu Item.")
    }
    if (newData.menuItemName === "") {
      errorList.push("Please enter the Menu Item Name.")
    }
    if (newData.price === "") {
      errorList.push("Please enter a Price.")
    }

    if (errorList.length < 1) {
      apis.updateRecordById("/menu/" + newData._id, newData, "menuItems")
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
    if (newData.menuItem === "") {
      errorList.push("Please enter the Menu Item.")
    }
    if (newData.menuItemName === "") {
      errorList.push("Please enter the Menu Item Name.")
    }
    if (newData.price === "") {
      errorList.push("Please enter a Price.")
    }


    if (errorList.length < 1) { //no error
      apis.insertRecord("/menu", newData, "menuItems")
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
    apis.deleteRecordById("/menu/" + oldData._id, "menuItems")
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
              }, 1250)
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
                  Add Menu Item
             </Button></span>


              </div>

            </div>
          )
        }}

      />

    </div>
  );
}

export default MenuTabComponent;
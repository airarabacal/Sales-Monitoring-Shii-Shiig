import React, { useState, useEffect, useRef } from 'react';
import apis from '../Api';
import tableIcons from "./TableIcons";
import MaterialTable from 'material-table';
import Alert from '@material-ui/lab/Alert';
import MaskedInput from 'react-text-mask';
import { TextField, Button } from '@material-ui/core';
import PropTypes from 'prop-types';

function CustomerTabComponent() {

  const tableRef = useRef();
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]); //table data

  //for error handling
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])

  useEffect(() => {
    apis.getAllRecords("/customers", "customers")
      .then(res => {
        setData(res.data.data)
      })
      .catch(error => {
        setData([]);
      })
  }, []);


  function TextMaskCustom(props) {
    const { inputRef, ...other } = props;

    return (
      <MaskedInput
        {...other}
        ref={(ref) => {
          inputRef(ref ? ref.inputElement : null);
        }}
        mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
        placeholder="(63) 000 - 000 - 0000"
        guide={false}
        placeholderChar={'\u2000'}
        keepCharPositions={true}
        showMask
      />

    );
  }

  TextMaskCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
  };


  var columns = [
    { title: "id", field: "_id", hidden: true },
    { title: "Customer Name", field: "customerName", headerStyle: { width: "20%", maxWidth: "20%" }, cellStyle: { width: "20%", maxWidth: "20%" } },
    {
      title: "Mobile No", field: "mobileNo", filtering: false, headerStyle: { width: "20%", maxWidth: "20%" }, cellStyle: { width: "20%", maxWidth: "20%" },
      editComponent: ({ value, onRowDataChange, rowData }) => (
        <TextField
          value={value}
          onChange={(event) => {
            onRowDataChange({
              ...rowData,
              mobileNo: event.target.value
            });
          }}
          InputProps={{
            inputComponent: TextMaskCustom,
          }}
        />
      )
    },
    { title: "Address", field: "address", headerStyle: { width: "60%", maxWidth: "60%" }, cellStyle: { width: "60%", maxWidth: "60%" } },

  ]

  function modifyRecord(newData, oldData) {
    //validation
    let errorList = []
    if (newData.customerName === "") {
      errorList.push("Please enter the Customer Name.")
    }
    if (newData.mobileNo === "") {
      errorList.push("Please enter a Mobile No.")
    }
    if (newData.address === "") {
      errorList.push("Please enter an Address.")
    }

    //setRecordID(newData._id);

    if (errorList.length < 1) {
      apis.updateRecordById("/customer/" + newData._id, newData, "customers")
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
    if (newData.customerName === "") {
      errorList.push("Please enter the Customer Name.")
    }
    if (newData.mobileNo === "") {
      errorList.push("Please enter a Mobile No.")
    }
    if (newData.address === "") {
      errorList.push("Please enter an Address.")
    }


    if (errorList.length < 1) { //no error
      apis.insertRecord("/customer", newData, "customers")
        .then(res => {
          //setRecordID(res.data.id);
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
    //setRecordID(oldData._id);
    apis.deleteRecordById("/customer/" + oldData._id, "customers")
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
                setSelectedRow(oldData.tableData.id)
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
                  Add Customer
                  </Button></span>


              </div>

            </div>
          )
        }}

      />

    </div>
  );
}

export default CustomerTabComponent;
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CustomerTabComponent from './Customer';
import MenuTabComponent from './Menu';
import ExpenseTabComponent from './Expense';
import OrderTabComponent from './Order';
import SalesPeriodComponent from './SalesPeriod';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={5}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper//,

  },
}));

function FullWidthTabs() {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Customers" {...a11yProps(0)} />
          <Tab label="Menu" {...a11yProps(1)} />
          <Tab label="Expenses" {...a11yProps(2)} />
          <Tab label="Orders" {...a11yProps(3)} />
          <Tab label="Sales Periods" {...a11yProps(4)} />
        </Tabs>
      </AppBar>

      <TabPanel value={value} index={0} dir={theme.direction}>
        <CustomerTabComponent />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <MenuTabComponent />
      </TabPanel>
      <TabPanel value={value} index={2} dir={theme.direction}>
        <ExpenseTabComponent />
      </TabPanel>
      <TabPanel value={value} index={3} dir={theme.direction}>
        <OrderTabComponent/>
        </TabPanel>
      <TabPanel value={value} index={4} dir={theme.direction}>
        <SalesPeriodComponent/>
        </TabPanel>

    </div>
  );
}

export default FullWidthTabs;

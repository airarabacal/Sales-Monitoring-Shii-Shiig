import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
// import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';

// const routes = (
//   <Router>
//     <Switch>
//       <Route path="/" component={App} />
//     </Switch>
//   </Router>
// );

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


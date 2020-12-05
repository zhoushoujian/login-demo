import React, { Component } from 'react';
// import { Router, Route, browserHistory } from 'react-router';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios'
import Login from './login'
import Register from './register'
import Forget from './forget'
import sign from './sign';

window.axios = axios
window.hostname = "http://localhost:8080"

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  return config;
}, function (err) {
  console.error("axios.interceptors.request err", err);
  return Promise.reject(err);
});
axios.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error.response.data.err)
);

class Routers extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forget" component={Forget} />
          <Route path="/sign" component={sign} />
          <Route path="/" component={Login} />
        </Switch>
      </Router>
    )
  }
}
export default Routers;

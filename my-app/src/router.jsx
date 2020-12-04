import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import axios from 'axios'
import Login from './login'
import Register from './register'
import Forget from './forget'
import sign from './sign';

window.axios = axios
window.hostname = "http://localhost:8000"

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('tk')
  if (token) {
    config.headers.Authorization = token
  }
  return config;
}, function (err) {
  console.error("axios.interceptors.request err", err);
  return Promise.reject(err);
});
axios.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error.response);
  }
);

class Routers extends Component {
  render() {
    return (
      <div className="outter">
        <Router history={browserHistory}>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forget" component={Forget} />
          <Route path="/sign" component={sign} />
          <Route path="/" component={Login} />
        </Router>
      </div>
    )
  }
}
export default Routers;

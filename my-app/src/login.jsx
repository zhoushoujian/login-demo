import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';

class Login extends Component {
  constructor(props) {
    super(props);
    this.loginUsernameRef = createRef();
    this.loginPasswordRef = createRef();
    this.state = {
      username: '',
      password: '',
      usernameTip: ""
    };
  }

  keyDownEvent = e => {
    if (e.keyCode === 13) {
      this.loginUsernameRef.current.blur();
      this.loginPasswordRef.current.blur();
      this.login();
    }
  };

  login = () => {
    const { username, password } = this.state;
    const data = { 
      username,
      password
    }
    return window.axios.post(window.hostname + "/login_verify", data)
      .then((response) => {
        console.log('response.data', response.data)
        this.props.history.push("/sign")
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  };

  handleBlur = () => {
    const { username } = this.state
    return window.axios.get(window.hostname + "/username_verify?username=" + username)
      .then((response) => {
        console.log('response.data', response.data)
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  setUsername = e => {
    const username = e.target.value
    this.setState({ username, usernameTip: "" });
  };

  setPassword = e => {
    const password = e.target.value
    this.setState({ password });
  };

  render() {
    const { username, password, usernameTip } = this.state;
    return (
      <div className="first-page">
        <div className="index">
          <div className="head">欢迎使用登录系统</div>
          <div className="main">
            <div className="input-content">
              <input
                value={username}
                size="26"
                placeholder="请输入用户名"
                onChange={this.setUsername}
                onKeyDown={this.keyDownEvent}
                ref={this.loginUsernameRef}
                className="form-input"
                onBlur={this.handleBlur}
              />
              <div className="error-tip">{usernameTip}</div>
            </div>
            <div className="input-content">
              <input
                type="password"
                value={password}
                placeholder="请输入登录密码"
                onChange={this.setPassword}
                onKeyDown={this.keyDownEvent}
                ref={this.loginPasswordRef}
                className="form-input"
              />
            </div>
            <div className="login-btn" onClick={this.login}>登录</div>
          </div>
          <div className="foot">
            <span onClick={this.register}>注册</span>
            <Link to="/forget_password">忘记密码</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Login

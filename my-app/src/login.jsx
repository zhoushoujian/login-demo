import React, { Component, createRef } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
    this.loginUsernameRef = createRef();
    this.loginPasswordRef = createRef();
    this.state = {
      username: '',
      password: '',
      usernameTip: "",
      passwordTip: ""
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
    if (!username) {
      return this.setState({ usernameTip: "用户名不能为空" })
    } else if (!password) {
      return this.setState({ passwordTip: "用密码不能为空" })
    }
    const data = {
      username,
      password
    }
    return window.axios.post(window.hostname + "/login_verify", data)
      .then((response) => {
        localStorage.setItem("token", response.result.token)
        localStorage.setItem("username", response.result.username)
        this.props.history.push("/sign")
      })
      .catch(err => {
        console.error('login err', err)
        if (err === "用户名不存在") {
          return this.setState({ usernameTip: err })
        } else if (err === "密码错误") {
          return this.setState({ passwordTip: err })
        }
      })
  };

  handleBlur = () => {
    const { username } = this.state
    if (!username) return;
    return window.axios.post(window.hostname + "/username_verify", { username })
      .catch(err => {
        console.error('handleBlur err', err)
        if (err === "用户名不存在") {
          this.setState({ usernameTip: err })
        }
      })
  }

  setUsername = e => {
    const username = e.target.value
    this.setState({ username, usernameTip: "" });
  };

  setPassword = e => {
    const password = e.target.value
    this.setState({ password, passwordTip: "" });
  };

  render() {
    const { username, password, usernameTip, passwordTip } = this.state;
    const { history } = this.props;
    return (
      <div className="login-area">
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
            {usernameTip && <div className="error-tip">{usernameTip}</div>}
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
            {passwordTip && <div className="error-tip">{passwordTip}</div>}
          </div>
          <div className="button" onClick={this.login}>登录</div>
        </div>
        <div className="foot">
          <span className="link" onClick={() => history.push("/register")}>注册</span>
          <span className="link" onClick={() => history.push("/forget")}>忘记密码</span>
        </div>
      </div>
    );
  }
}

export default Login

import React, { Component } from 'react';
class register extends Component {

  state = {
    username: "",
    password: "",
    passwordAgain: "",
    usernameTip: "",
    passwordTip: ""
  }

  registerUsernameBlur = () => {
    const { username } = this.state
    return window.axios.post(window.hostname + "/username_verify", { username })
      .then((response) => {
        if (response.result === "exist") {
          this.setState({ usernameTip: '用户名已存在' })
        }
      })
      .catch(err => {
        if (err !== "用户名不存在") {
          console.error('registerUsernameBlur err', err)
        }
      })
  }

  registerPwdBlurAgain = () => {
    const { password, passwordAgain } = this.state
    if (password !== passwordAgain) {
      this.setState({ passwordTip: "两次密码不一致" })
    }
  }

  registerKeyDownEvent = (e) => {
    if (e.keyCode === 13) {
      this.register();
    }
  }

  register = () => {
    const { username, password, passwordAgain } = this.state
    const { history } = this.props
    if (!username) {
      this.setState({ usernameTip: "用户名不能为空" })
      return;
    } else if (!password) {
      this.setState({ passwordTip: "两次密码不一致" })
      return;
    } else if (password !== passwordAgain) {
      this.setState({ passwordTip: "两次密码不一致" })
      return;
    }
    const data = { username, password }
    return window.axios.post(window.hostname + "/register_verify", data)
      .then(() => {
        history.push("/login")
      })
      .catch(err => {
        console.error('register err', err)
        if (err === "用户名已存在") {
          this.setState({ usernameTip: err })
        }
      })
  }

  render() {
    const { username, password, passwordAgain, usernameTip, passwordTip } = this.state
    const { history } = this.props;
    return (
      <div className="login-area">
        <div className="head">注册新用户</div>
        <div className="main">
          <div className="input-content">
            <input
              type="text"
              name="register-username"
              placeholder="请输入用户名"
              className="form-input"
              size="26"
              value={username}
              onChange={e => this.setState({ username: e.target.value, usernameTip: "" })}
              onBlur={this.registerUsernameBlur}
              onKeyDown={this.registerKeyDownEvent}
            />
            {usernameTip && <div className="error-tip">{usernameTip}</div>}
          </div>
          <div className="input-content">
            <input
              type="password"
              placeholder="请输入密码"
              className="form-input"
              value={password}
              onChange={e => this.setState({ password: e.target.value, passwordTip: "" })}
              onKeyDown={this.registerKeyDownEvent}
            />
          </div>
          <div className="input-content">
            <input
              type="password"
              placeholder="请再次输入密码"
              className="form-input"
              value={passwordAgain}
              onBlur={this.registerPwdBlurAgain}
              onKeyDown={this.registerKeyDownEvent}
              onChange={e => this.setState({ passwordAgain: e.target.value, passwordTip: "" })}
            />
            {passwordTip && <div className="error-tip">{passwordTip}</div>}
          </div>
          <div className="button" onClick={this.register}>提交</div>
        </div>
        <div className="foot">
          <span className="link" onClick={() => history.push("/login")}>返回</span>
        </div>
      </div>
    );
  }
}

export default register
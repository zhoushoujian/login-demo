import React, { Component } from 'react';
import { Link } from 'react-router';

export default class register extends Component {

  state = {
    username: "",
    password: "",
    passwordAgain: "",
    usernameTip: ""
  }

  registerUsernameBlur = () => {
    const { username } = this.state
    return window.axios.get(window.hostname + "/username_verify?username=" + username)
      .then((response) => {
        console.log('response.data', response.data)
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  registerPwdBlurAgain = () => {
    const { password, passwordAgain } = this.state
    if (password !== passwordAgain) {
      alert("两次密码不一致")
    }
  }

  registerKeyDownEvent = (e) => {
    if (e.keyCode === 13) {
      this.register();
    }
  }

  register = () => {
    const { username, password, passwordAgain } = this.state
    if (!username) {
      alert("用户名不能为空!");
      return;
    } else if (!password) {
      alert("密码不能为空!");
      return;
    } else if (password !== passwordAgain) {
      alert("两次输入的密码不一致，请重新输入");
      return;
    }
    const data = { username, password }
    return window.axios.get(window.hostname + "/register_verify", data)
      .then((response) => {
        console.log('response.data', response.data)
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  render() {
    const { username, password, passwordAgain, usernameTip } = this.state
    return (
      <div className="register-area">
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
            <div className="error-tip">{usernameTip}</div>
          </div>
          <div className="input-content">
            <input
              type="password"
              placeholder="请输入密码"
              className="form-input"
              value={password}
              onChange={e => this.setState({ password: e.target.value })}
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
              onChange={e => this.setState({ passwordAgain: e.target.value })}
            />
          </div>
          <input
            className="register-button"
            value="提交"
            onClick={this.register}
          />
        </div>
        <div className="foot">
          <Link to="/">
            <div className="back">返回</div>
          </Link>
        </div>
      </div>
    );
  }
}
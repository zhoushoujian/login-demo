import React, { Component } from 'react';

export default class forget extends Component {

  state = {
    username: "",
    usernameTip: ""
  }

  forgetUsernameBlur = () => {
    const { username } = this.state
    return window.axios.post(window.hostname + "/username_verify", { username })
      .catch(err => {
        console.error('forgetUsernameBlur err', err)
        if (err === "用户名不存在") {
          this.setState({ usernameTip: err })
        }
      })
  }

  forgetKeyDownEvent = (e) => {
    if (e.keyCode === 13) {
      this.forget();
    }
  }

  forget = () => {
    const { username } = this.state
    if (!username) {
      this.setState({ usernameTip: "用户名不能为空" })
      return;
    };
    return window.axios.post(window.hostname + "/forget_pwd", { username })
      .then((response) => {
        this.setState({ usernameTip: `密码：${response.result}` })
      })
      .catch(err => {
        if (err === '用户名非法') {
          this.setState({ usernameTip: err })
        }
        console.error('handleBlur err', err)
      })
  }

  render() {
    const { username, usernameTip } = this.state
    const { history } = this.props;
    return (
      <div className="login-area">
        <div className="head">忘记密码</div>
        <div className="main">
          <div className="input-content">
            <input
              type="text"
              placeholder="请输入用户名"
              className="form-input"
              size="26"
              value={username}
              onChange={e => this.setState({ username: e.target.value, usernameTip: "" })}
              onBlur={this.forgetUsernameBlur}
              onKeyDown={this.forgetKeyDownEvent}
            />
            {usernameTip && <div className="error-tip">{usernameTip}</div>}
          </div>
          <div className="button" onClick={this.forget}>提交</div>
        </div>
        <div className="foot">
          <span className="link" onClick={() => history.push("/login")}>返回</span>
        </div>
      </div >
    );
  }
}

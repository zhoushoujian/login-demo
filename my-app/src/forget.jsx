import React, { Component } from 'react';
import { Link } from 'react-router';

export default class forget extends Component {

  state = {
    username: ""
  }

  forgetUsernameBlur = () => {
    const { username } = this.state
    return window.axios.get(window.hostname + "/username_verify?username=" + username)
      .then((response) => {
        console.log('response.data', response.data)
      })
      .catch(err => {
        console.error('handleBlur err', err)
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
      alert("用户名不能为空!")
      return;
    };
    return window.axios.post(window.hostname + "/forget_pwd?username=" + username)
      .then((response) => {
        console.log('response.data', response.data)
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  render() {
    const { username } = this.state
    return (
      <div className="forget-area">
        <div className="head">忘记密码</div>
        <div className="main">
          <input
            type="text"
            placeholder="请输入用户名"
            className="form-input"
            size="26"
            value={username}
            onChange={e => this.setState({ username: e.target.value })}
            onBlur={this.forgetUsernameBlur}
            onKeyDown={this.forgetKeyDownEvent}
          />
          <input
            className="button"
            value="提交"
            onClick={this.forget}
          />
        </div>
        <div className="foot">
          <Link to="/">返回</Link>
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import "./sign.css"

class Sign extends Component {

  constructor(props) {
    super(props)
    this.token = window.localStorage.getItem("token")
    this.username = localStorage.getItem("username")
    this.state = {
      greetings: "",
      lastSignTime: "",
      alreadySignPersons: [],
      notSignPersons: [],
      signStatus: false
    }
  }

  componentDidMount() {
    if (!this.token) {
      console.log("非法登录，即将跳往登录页");
      return this.logout()
    }
    this.getGreetings();
    this.getLastSignTime()
    this.getSignPersons()
  }

  getGreetings = () => {
    const hour = new Date().getHours();
    let greetings = ""
    if (hour < 6) {
      greetings = "凌晨好！";
    } else if (hour < 8) {
      greetings = "早上好！";
    } else if (hour < 11) {
      greetings = "上午好！";
    } else if (hour < 14) {
      greetings = "中午好！";
    } else if (hour < 17) {
      greetings = "下午好！";
    } else if (hour < 19) {
      greetings = "傍晚好！";
    } else if (hour < 24) {
      greetings = "晚上好！";
    }
    this.setState({ greetings })
  }

  getLastSignTime = () => {
    return window.axios.post(window.hostname + "/last_sign")
      .then((response) => {
        // 这里特意留下时分秒，有兴趣的同学自己写写看
        this.setState({ lastSignTime: response.result })
      })
      .catch(err => {
        console.error('getLastSignTime err', err)
        if (err === "请重新登录" || err === "非法登录，即将跳往登录页") {
          return this.logout()
        }
      })
  }

  getSignPersons = () => {
    return window.axios.post(window.hostname + "/sign_persons")
      .then((response) => {
        const year = new Date().getFullYear(),
          month = new Date().getMonth() + 1,
          day = new Date().getDate(),
          date = `${year}_${month}_${day}`

        const signedArray = [], unsignedArray = [], info = response.result;
        for (let i = 0, l = info.length; i < l; i++) {
          if (info[i].date === date) {
            signedArray.push(info[i].username);
          } else {
            unsignedArray.push(info[i].username);
          }
        }
        let signStatus = false
        if (signedArray.includes(this.username)) {
          signStatus= true;
        }
        this.setState({
          alreadySignPersons: signedArray,
          notSignPersons: unsignedArray,
          signStatus
        })
      })
      .catch(err => {
        console.error('getSignPersons err', err)
      })
  }

  signIn = () => {
    return window.axios.post(window.hostname + "/go_sign")
      .then((response) => {
        if (response.result.status === "已签到") {
          return alert("今天已签到")
        }
        localStorage.setItem("token", response.result.token)
        this.getLastSignTime()
        this.getSignPersons()
      })
      .catch(err => {
        console.error('signIn err', err)
        if (err === "请重新登录" || err === "非法登录，即将跳往登录页") {
          return this.logout()
        } else if (err === "用户名不存在") {
          alert("用户名不存在")
        }
      })
  }

  logout = () => {
    localStorage.removeItem("token");
    this.props.history.push("/login")
    return;
  }

  render() {
    const { greetings, lastSignTime, alreadySignPersons, notSignPersons, signStatus } = this.state
    return (
      <div className="sign-main">
        <div className="header">
          <span className="greetings">{greetings}</span>
          <span className="user">{this.username}</span> &nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="logout" onClick={this.logout}>注销</span>
        </div>
        <div className="body">
          <div className="sign-area">
            {
              signStatus 
              ? <div className="signed-status">已签到</div>
              : <div className="sign" onClick={this.signIn}>签到</div>
            }
            <div className="last-sign-time">
              <span>上一次签到时间：</span>
              <span className="last-sign">{lastSignTime}</span>
            </div>
          </div>
          <div className="count-area">
            <div className="signed">
              <span className="signed-text">已签到:</span>
              <p className="signed-persons">
                {alreadySignPersons.join(", ")}
              </p>
            </div>
            <div className="not-signed">
              <span className="not-signed-text">未签到:</span>
              <p className="not-signed-persons">
                {notSignPersons.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Sign;
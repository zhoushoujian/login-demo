import React, { Component } from 'react';

class Sign extends Component {

  constructor(props) {
    super(props)
    this.token = window.localStorage.getItem("token")
    this.state = {
      greetings: "",
      lastSignTime: "",
      alreadySignPersons: [],
      notSignPersons: []
    }
  }

  componentDidMount() {
    if (!this.token) {
      console.log("非法登录，即将跳往登录页");
      window.location.href = window.hostname;
      return;
    }
    this.getGreetings();
    this.getLastSignTime()
    this.getSignPersons()
  }

  getGreetings = () => {
    const hour = new Date().getHours();
    let greetings = ""
    if (hour < 6) {
      greetings = "凌晨好！&nbsp;";
    } else if (hour < 8) {
      greetings = "早上好！&nbsp;";
    } else if (hour < 11) {
      greetings = "上午好！&nbsp;";
    } else if (hour < 14) {
      greetings = "中午好！&nbsp;";
    } else if (hour < 17) {
      greetings = "下午好！&nbsp;";
    } else if (hour < 19) {
      greetings = "傍晚好！&nbsp;";
    } else if (hour < 24) {
      greetings = "晚上好！&nbsp;";
    }
    this.setState({ greetings })
  }

  getLastSignTime = () => {
    return window.axios.get(window.hostname + "/last_sign")
      .then((response) => {
        console.log('response.data', response.data)
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  getSignPersons = () => {
    return window.axios.get(window.hostname + "/sign_persons")
      .then((response) => {
        console.log('response.data', response.data)
        // year = new Date().getFullYear(),
        //   month = new Date().getMonth() + 1,
        //   day = new Date().getDate(),
        //   date = `${year}_${month}_${day}`

        // let info = responseText.info,
        //   sigedArray = [],
        //   unsignedArray = [];
        // for (let i = 0, l = info.length; i < l; i++) {
        //   if (info[i].date === date) {
        //     sigedArray.push(info[i].username);
        //   } else {
        //     unsignedArray.push(info[i].username);
        //   }
        // }
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  signIn() {
    return window.axios.post(window.hostname + "/go_sign")
      .then((response) => {
        console.log('response.data', response.data)
        // window.localStorage.setItem("token", responseText.token);
      })
      .catch(err => {
        console.error('handleBlur err', err)
      })
  }

  logout = () => {
    localStorage.removeItem("token");
    this.props.history.push("/login")
    return;
  }

  render() {
    const { greetings, lastSignTime, alreadySignPersons, notSignPersons } = this.state
    return (
      <div className="sign-main">
        <div className="header">
          <span className="greetings">{greetings}</span>
          <span className="user">{localStorage.getItem("username")}</span> &nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="logout" onClick={this.logout}>注销</span>
        </div>
        <div className="body">
          <div className="sign-area">
            <div className="sign">签到</div>
            <div className="last-sign-time">
              <span>上一次签到时间：</span>
              <span className="last-sign">{lastSignTime}</span>
            </div>
          </div>
          <div className="count-area">
            <div className="signed">
              <span className="signed-text">已签到:</span>
              <p className="signed-persons">
                {alreadySignPersons.join()}
              </p>
            </div>
            <div className="not-signed">
              <span className="not-signed-text">未签到:</span>
              <p className="not-signed-persons">
                {notSignPersons.join()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Sign;
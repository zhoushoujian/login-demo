import React, { Component } from 'react';
import { Link } from 'react-router';
import './App.css';

class App extends Component {

    constructor(props){
        super(props);
        this.state={
            token:""
        }
    }

    usernameBlur = () => {
        let usernameValue = document.getElementsByName("username")[0].value;
        if (!usernameValue) {
            document.getElementsByClassName("tips")[0].innerHTML = "用户名不能为空!";
            document.getElementsByName("username")[0].placeholder = "请输入用户名";
            return;
        };
        let data = Object.assign({}, {
            username: usernameValue
        })
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/username_verify", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                console.log("send success", xhr.responseText);
                if (xhr.responseText === "用户名不存在") {
                    document.getElementsByClassName("tips")[0].innerHTML = "用户名不存在！";
                } else if (xhr.responseText === "用户名存在") {
                    document.getElementsByClassName("tips")[0].innerHTML = "";
                }
            }
        };
        console.log("data", data);
        xhr.send(JSON.stringify(data));
    }

    pwdBlur = () => {
        let pwdValue = document.getElementsByName("password")[0].value;
        if (!pwdValue) {
            document.getElementsByClassName("tips")[1].innerHTML = "密码不能为空!";
            document.getElementsByName("password")[0].placeholder = "请输入密码";
        }
    }

    inputClick = (number, label, placehloderStr) => {
        document.getElementsByClassName("tips")[number].innerHTML = "";
        document.getElementsByName(label)[0].placeholder = placehloderStr;
        document.getElementsByClassName("server-tip")[0].style.height = 0;
        document.getElementsByClassName("server-tip")[0].innerHTML = "";
    }

    keyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
            this.login();
        }
    }

    login = () => {
        document.getElementsByClassName("tips")[0].innerHTML = "";
        document.getElementsByClassName("tips")[1].innerHTML = "";
        document.getElementsByClassName("server-tip")[0].style = "0";
        document.getElementsByClassName("server-tip")[0].innerHTML = "";
        let usernameValue = document.getElementsByName("username")[0].value;
        let pwdValue = document.getElementsByName("password")[0].value;
        let data = Object.assign({}, {
            username: usernameValue
        }, {
            pwd: pwdValue
        })
        if (!usernameValue) {
            alert("用户名不能为空!");
            return;
        } else if (!pwdValue) {
            alert("密码不能为空!");
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/login_verify", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                console.log("send success", xhr.responseText);
                if (xhr.responseText === "用户名错误") {
                    alert("用户名错误！");
                    return;
                } else if (xhr.responseText === "密码错误") {
                    alert("密码错误！");
                    return;
                } else if (xhr.responseText === "用户名不能为空") {
                    alert("用户名不能为空！");
                    return;
                } else {
                    window.localStorage.setItem("token", xhr.responseText);
                    window.localStorage.setItem("username", usernameValue);
                    let timer = setInterval(function(){
                        if(window.localStorage.getItem("token")){
                            clearInterval(timer);
                            window.location.href = "http://localhost:3000/sign";
                        }
                    },50); 
                }
            }
        };
        console.log("data", data);
        xhr.send(JSON.stringify(data));
    }

    regUser = () => {
       
    }

    forgetPwd = () => {
       
    }


  render() {
    return (
        <div className="first-page">
      <div className="index">
        <div className="head">欢迎访问签到系统</div>
        <div className="main">
            <div className="input-content">
                <div className="content">
                    <input type="text" name="username" placeholder="请输入用户名" className="form" size="26" onBlur={this.usernameBlur} onClick={() => this.inputClick('0','username','请输入用户名')} onKeyDown={(event) => this.keyDownEvent(event)} />
                </div>
                <div className="tips"></div>
            </div>
            <div className="input-content">
                <div className="content">
                    <input name="password" type="password" placeholder="请输入密码" className="form" onBlur={this.pwdBlur} onClick={() => this.inputClick('1','password','请输入密码')} onKeyDown={(event) => this.keyDownEvent(event)} />
                </div>
                <div className="tips"></div>
            </div>
            <div className="server-tip"></div>
            <input type="button" className="button" value="登录" onClick={this.login} />
        </div>
        <div className="foot">
        <Link to="/register">
            注册用户名
        </Link>
        
        <Link to="/forget">
            忘记密码
        </Link>
        </div>
    </div>
    </div>
    );
  }
}

class register extends Component {

    registerUsernameBlur = () => {
        let usernameValue = document.getElementsByName("register-username")[0].value;
        if (!usernameValue) {
            document.getElementsByClassName("register-tips")[0].innerHTML = "用户名不能为空!";
            document.getElementsByName("register-username")[0].placeholder = "请输入用户名";
            return;
        };
        let data = Object.assign({}, {
            username: usernameValue
        })
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/username_verify", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                console.log("send success", xhr.responseText);
                if (xhr.responseText === "用户名已存在") {
                    document.getElementsByClassName("register-tips")[0].innerHTML = "用户名已存在！";
                }
            }
        };
        console.log("data", data);
        xhr.send(JSON.stringify(data));
    }

    registerPwdBlur = () => {
        let pwdValue = document.getElementsByName("register-password")[0].value;
        if (!/^(?=(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d))[^]{6,16}$/.test(pwdValue)) {
            document.getElementsByClassName("register-tips")[1].innerHTML = "密码设置不符合要求!";
            document.getElementsByName("register-password")[0].placeholder = "请输入密码，至少包含一个数字和字母";
        }
    }

    registerPwdBlurAgain = () => {
        let pwdValue = document.getElementsByName("register-password")[0].value;
        let pwdValueAgain = document.getElementsByName("register-password-again")[0].value;
        if (pwdValue !== pwdValueAgain) {
            document.getElementsByClassName("register-tips")[2].innerHTML = "两次输入的密码不一致，请重新输入";
            document.getElementsByName("register-password-again")[0].placeholder = "请再次输入密码，至少包含一个数字和字母";
        }
    }

    registerInputClick = (number, label, placehloderStr) => {
        document.getElementsByClassName("register-tips")[number].innerHTML = "";
        document.getElementsByName(label)[0].placeholder = placehloderStr;
        document.getElementsByClassName("server-tip")[0].style.height = 0;
        document.getElementsByClassName("server-tip")[0].innerHTML = "";
    }

    registerKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
            this.register();
        }
    }

    register = () => {
        let usernameValue = document.getElementsByName("register-username")[0].value;
        let pwdValue = document.getElementsByName("register-password")[0].value;
        let pwdValueAgain = document.getElementsByName("register-password-again")[0].value;
        if (!usernameValue) {
            alert("用户名不能为空!");
            return;
        } else if (!pwdValue) {
            alert("密码不能为空!");
            return;
        } else if (!/^(?=(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d))[^]{6,16}$/.test(pwdValue)) { //密码至少包含一个数字和一个字母
            alert("密码设置不符合要求!");
            return;
        } else if (pwdValue !== pwdValueAgain) {
            alert("两次输入的密码不一致，请重新输入");
            return;
        }
        let data = Object.assign({}, {
            username: usernameValue
        }, {
            pwd: pwdValue
        })
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/register_verify", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                console.log("send success", xhr.responseText);
                if (xhr.responseText === "用户名非法") {
                    alert("用户名非法");
                    return;
                } else if (xhr.responseText === "密码设置不符合要求!") {
                    alert("密码设置不符合要求");
                    return;
                } else if (xhr.responseText === "用户名已存在") {
                    alert("用户名已存在！");
                    return;
                } else if (xhr.responseText === "register successs"){
                    alert("注册成功！");
                    document.getElementsByName("register-username")[0].value = "";
                    document.getElementsByName("register-password")[0].value = "";
                    document.getElementsByName("register-password-again")[0].value = "";
                    window.location.href="http://localhost:3000/"
                }
            }
        };
        console.log("data", data);
        xhr.send(JSON.stringify(data));
    }

    render() {
        return (
            <div className="register-area">
                <div className="head">注册新用户</div>
                <div className="input-content">
                    <div className="content">
                        <input type="text" name="register-username" placeholder="请输入用户名" className="form" size="26" onBlur={this.registerUsernameBlur} onClick={() => this.registerInputClick('0','register-username','请输入用户名')} onKeyDown={(event) => this.registerKeyDownEvent(event)} />
                    </div>
                    <div className="register-tips"></div>
                </div>
                <div className="input-content">
                    <div className="content">
                    <input name="register-password" type="password" placeholder="请输入密码，至少包含一个数字和字母" className="form" onBlur={this.registerPwdBlur} onClick={() => this.registerInputClick('1','register-password','请输入密码，至少包含一个数字和字母')} onKeyDown={(event) => this.registerKeyDownEvent(event)} />
                    </div>
                    <div className="register-tips"></div>
                </div>
                <div className="input-content">
                    <div className="content">
                    <input name="register-password-again" type="password" placeholder="请再次输入密码，至少包含一个数字和字母" className="form" onBlur={this.registerPwdBlurAgain} onClick={() => this.registerInputClick('2','register-password-again','请再次输入密码，至少包含一个数字和字母')} onKeyDown={(event) => this.registerKeyDownEvent(event)} />
                    </div>
                    <div className="register-tips"></div>
                </div>
                <div className="server-tip"></div>
                <input type="button" className="button" value="提交" onClick={this.register} />
                <div className="foot">
                <Link to="/"><div className="back" onClick={back}>返回</div></Link>
                </div>
            </div>
        )
    }
}

 function back () {

}

class forget extends Component {
    componentDidMount(){
        document.querySelector("body").style.backgroundImage="";
        document.querySelector("body").style.backgroundColor="#dbede9";
    }
    forgetUsernameBlur = () => {
        let usernameValue = document.getElementsByName("forget-username")[0].value;
        if (!usernameValue) {
            document.getElementsByClassName("forget-tips")[0].innerHTML = "用户名不能为空!";
            document.getElementsByName("forget-username")[0].placeholder = "请输入用户名";
            return;
        };
        let data = Object.assign({}, {
            username: usernameValue
        })
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/username_verify", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                console.log("send success", xhr.responseText);
                if (xhr.responseText === "用户名不存在") {
                    document.getElementsByClassName("forget-tips")[0].innerHTML = "用户名不存在！";
                } else if (xhr.responseText === "用户名存在") {
                    document.getElementsByClassName("tips")[0].innerHTML = "";
                }
            }
        };
        console.log("data", data);
        xhr.send(JSON.stringify(data));
    }

    forgetrKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
            this.forget();
        }
    }

    forget = () => {
        let usernameValue = document.getElementsByName("forget-username")[0].value;
        if (!usernameValue) {
            alert("用户名不能为空!")
            return;
        };
        let data = Object.assign({}, {
            username: usernameValue
        })
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/forget_pwd", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                console.log("send success", xhr.responseText);
                if (xhr.responseText === "用户名不存在") {
                    alert("用户名不存在！");
                    return;
                } else if (xhr.responseText === "用户名不存在") {
                    alert("用户名不存在！");
                    return;
                } else {
                    document.getElementsByClassName("forget-tips")[0].innerHTML = xhr.responseText;
                    setTimeout(function() {
                        alert(`您的密码是${xhr.responseText}`);
                    })
                }
            }
        };
        console.log("data", data);
        xhr.send(JSON.stringify(data));
    }

    inputClick = () => {
        // document.querySelector(".forget-tips")[0].innerHTML = "";
    }

    render(){
       
     return(
        <div className="forget-area">
            <div className="head">忘记密码</div>
            <div className="input-content">
                <div className="content">
                    <input type="text" name="forget-username" placeholder="请输入用户名" className="form" size="26" onBlur={this.forgetUsernameBlur} onClick={() => this.inputClick('0','username','请输入用户名')} onKeyDown={(event) => this.forgetrKeyDownEvent(event)} />
                </div>
                <div className="forget-tips"></div>
            </div>
            <input type="button" className="button" value="提交" onClick={this.forget} />
            <div className="foot">
                <Link to="/"><div className="back" onClick={() => back()}>返回</div></Link>
            </div>
        </div>
     )
    }
}

export  {
    App,
    register,
    forget
};

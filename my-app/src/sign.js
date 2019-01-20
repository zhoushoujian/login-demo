import React, { Component } from 'react';
import './sign.css';
import $ from "jquery";


let token = window.localStorage.getItem("token"),
	username = window.localStorage.getItem("username"),
	data = Object.assign({}, {
		token: token
	}),
	year = new Date().getFullYear(),
	month = new Date().getMonth() + 1,
	day = new Date().getDate(),
	date = `${year}_${month}_${day}`; //获取今天的日期

function signIn() {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:8080/go_sign", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
			let responseText = JSON.parse(xhr.responseText);
			console.log("receive success", responseText);
			if (responseText === "已签到") {
				// alert("已签到!");
				return;
			} else if (responseText === "身份已过期,请重新登录"){
				console.error("身份已过期,请重新登录页");
				alert("身份已过期,请重新登录");
				window.location.href = "http://localhost:3000";
			} else if (responseText === "用户名不存在"){
				alert("非法登录,点击确定后回到登录页面");
				window.location.href = "http://localhost:3000";
			} else if (responseText.str === "未签到") {
				//更新token
				// this.setState({
				// 	token:responseText.token
				// },() => {
				window.localStorage.setItem("token", responseText.token);
				alert("签到成功！");
				window.location.reload();
				return;
				// });
			}
		}
	};
	console.log("data", data);
	xhr.send(JSON.stringify(data));
}


function showError(error){ 
	console.warn("111",error)
  switch(error.code) { 
    case error.PERMISSION_DENIED: 
		$("#position-location").html("定位失败,用户拒绝请求地理定位"); 
      break; 
    case error.POSITION_UNAVAILABLE: 
		$("#position-location").html("定位失败,位置信息是不可用"); 
      break; 
    case error.TIMEOUT: 
		$("#position-location").html("定位失败,请求获取用户位置超时"); 
      break; 
    case error.UNKNOWN_ERROR: 
		$("#position-location").html("定位失败,定位系统失效"); 
			break; 
		default:
		$("#position-location").html("发生了错误!");
			break;
  } 
} 

function showPosition(position){
  var latlon = position.coords.latitude+','+position.coords.longitude; 
	console.warn("latlon",latlon)
  //baidu
  var url = `http://api.map.baidu.com/geocoder/v2/?ak=4ce44ddc82b0c74ed149d6b47156537c&callback=renderReverse&location=${latlon}&output=json&pois=0`; 
  $.ajax({
    type: "GET", 
    dataType: "jsonp", 
    url: url, 
      beforeSend: function(){
        $("#position-location").html('正在定位...'); 
      }, 
      success: function (json) { 
        if(json.status===0){ 
					$("#position-location").html("您当前的位置:"+json.result.formatted_address+json.result.sematic_description); 
					console.log(json.result);
        } 
      }, 
      error: function (XMLHttpRequest, textStatus, errorThrown) { 
        $("#position-location").html(latlon+"地址位置获取失败"); 
    }
	});
}

function getLocation(){ 
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(showPosition,showError); 
  }else{ 
    $("#position-location").html("浏览器不支持地理定位。"); 
  } 
}


class Sign extends Component {

	componentWillMount() {
		// getLocation();
	}

	componentDidMount(){
		if (!token) {
				// alert("非法登录，即将跳往登录页");
				console.log("非法登录，即将跳往登录页");
				window.location.href = "http://localhost:3000";
				return;
		}
		getLocation();
		this.getUsername();
	}

	componentWillUnmount(){
		window.localStorage.removeItem("token");
		window.localStorage.removeItem("username");
	}

	getUsername = () => {
		// console.log("token", token)
		let signDom = document.getElementsByClassName("sign")[0];
		document.getElementsByClassName("user")[0].innerHTML = username;
		let hour = new Date().getHours();
		if (hour < 6) {
				document.getElementsByClassName("greetings")[0].innerHTML = "凌晨好！&nbsp;";
		} else if (hour < 8) {
				document.getElementsByClassName("greetings")[0].innerHTML = "早上好！&nbsp;";
		} else if (hour < 11) {
				document.getElementsByClassName("greetings")[0].innerHTML = "上午好！&nbsp;";
		} else if (hour < 14) {
				document.getElementsByClassName("greetings")[0].innerHTML = "中午好！&nbsp;";
		} else if (hour < 17) {
				document.getElementsByClassName("greetings")[0].innerHTML = "下午好！&nbsp;";
		} else if (hour < 19) {
				document.getElementsByClassName("greetings")[0].innerHTML = "傍晚好！&nbsp;";
		} else if (hour < 24) {
				document.getElementsByClassName("greetings")[0].innerHTML = "晚上好！&nbsp;";
		}
		// document.getElementsByClassName("now-time")[0].innerHTML = date;
		signDom.addEventListener("click", signIn,false);
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "http://localhost:8080/last_sign", true); //查询最后一次打卡日期
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			
				if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
						console.log("receive success", xhr.responseText);
						if (xhr.responseText === "未查到历史签到数据") {
								document.getElementsByClassName("last-sign")[0].innerHTML = "未查到历史签到数据";
						} else if (xhr.responseText === "非法登录，即将跳往登录页") {
								console.error("非法登录，即将跳往登录页");
								window.location.href = "http://localhost:3000";
						} else if (xhr.responseText === "身份已过期,请重新登录") {
							console.error("身份已过期,请重新登录页");
							alert("身份已过期,请重新登录");
							window.location.href = "http://localhost:3000";
					  } else {
								let responseText = JSON.parse(xhr.responseText)
								console.log("xhr.responseText", responseText);
								console.log("date", date);
								//前端用本地时间和服务器返回的时间做对比判断是否已签到,后端通过服务器时间和数据库保存的最后一次签到时间对比判断是否已签到
								if (responseText.lastDay === date) {
										signDom.removeEventListener("click", signIn, false);
										signDom.innerHTML = "已签到";
										signDom.style.color = "#EDEDED";
										signDom.style.backgroundColor = "#ccc";
										signDom.style.border = "1px solid #ccc";
								}
								document.getElementsByClassName("last-sign")[0].innerHTML = responseText.lastDay;
								let info = responseText.info,
										sigedArray = [],
										unsignedArray = [];
								for (let i = 0, l = info.length; i < l; i++) {
										if (info[i].date === date) {
												sigedArray.push(info[i].username);
										} else {
												unsignedArray.push(info[i].username);
										}
								}
								console.log("sigedArray", sigedArray, "unsignedArray", unsignedArray)
								document.getElementsByClassName("signed-persons")[0].innerHTML = sigedArray;
								document.getElementsByClassName("not-signed-persons")[0].innerHTML = (unsignedArray);
						}
				}
		};
		console.log("data", data);
		xhr.send(JSON.stringify(data));
  }

logout = () => {
	window.localStorage.removeItem("token");
	window.location.href = "http://localhost:3000";
	return;
}

	render (){
		return (
			<div className="sign-main">
        <div className="header"><span className="greetings"></span><span className="user">111</span> &nbsp;&nbsp;|&nbsp;&nbsp;<span className="logout" onClick={this.logout}>注销</span></div>
        <div className="body">
            <div className="sign-area">
                <div className="sign">签到</div>
								<div id="position-location" style={{"marginTop":"20px"}}></div>
                {/* <div className="today">今天：<span className="now-time"></span></div> */}
                <div className="last-sign-time">上一次签到时间：<span className="last-sign"></span></div>
            </div>
            <div className="count-area">
                <div className="signed"><span className="signed-text">已签到:</span>
                    <p className="signed-persons"></p>
                </div>
                <div className="not-signed"><span className="not-signed-text">未签到:</span>
                    <p className="not-signed-persons"></p>
                </div>
            </div>
        </div>
        {/* <div className="foot">
            copyright©2018 zhoushoujian.com<br/> all rights reserved
        </div> */}
    </div>
		)
	}
}

export default Sign;
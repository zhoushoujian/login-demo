require('./logger'); //加载日志系统
let os = require("os"),
    numCPUs = os.cpus().length,
    cluster = require("cluster"); //开启多线程
if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('listening', function (worker, address) {
        // console.log('listening: worker ' + worker.process.pid + ', port: ' + address.port);
    });
    cluster.on('online', function (worker) {
        console.log('[master] ' + 'online: worker' + worker.id);
    });
    cluster.on('disconnect', function (worker) {
        console.log('[master] ' + 'disconnect: worker' + worker.id);
    });
    cluster.on('exit', function (worker, code, signal) {
        console.warn('worker ' + worker.process.pid + ' died');
    });
} else {
    let http = require('http'),
        Render = require('./app/render'), //加载静态文件
        MongoClient = require('mongodb').MongoClient, //加载数据库
        url = 'mongodb://localhost:27017',
        jwt = require('jsonwebtoken'), // 引入 jsonwebtoken
        data, db_password, username, year, month, day, date;
    //获取ip地址
    var address
    var networks = os.networkInterfaces()
    Object.keys(networks).forEach(function (k) {
        for (var kk in networks[k]) {
            if (networks[k][kk].family === "IPv4" && networks[k][kk].address !== "127.0.0.1") {
                address = networks[k][kk].address;
                return address;
            }
        }
    })

    let i = 0; //统计主页的访问次数
    let server = http.createServer(function (req, res) {
        //允许跨域访问
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        function getIp(str) { //封装获取访问者ip的函数
            let ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
            if (ip.split(',').length > 0) {
                ip = ip.split(',')[0]
            }
            logger.info(` ${str}的访问者ip`, ip);
        }
        logger.debug(` server  收到客户端的请求数量`, req.url, req.method, ++i);
        switch (req.url) { //nodejs路由
            case "/":
                res.end();
                break;
            case "/username_verify": //响应ajax验证用户名
                getIp("验证用户名");
                data = "";
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on("end", function () {
                    try {
                        data = JSON.parse(data);
                        logger.debug("username_verify  data", data);
                        username = data.username;
                        // logger.debug("username_verify  username", username);
                        MongoClient.connect(url, {
                            useNewUrlParser: true
                        }, function (err, db) {
                            if (err) {
                                logger.error("username_verify MongoClient.connect  err", err);
                                throw err;
                            }
                            var dbo = db.db("mldn");
                            let whereStr = {
                                "username": username
                            }
                            // logger.debug("username_verify  whereStr", whereStr);
                            dbo.collection("site").find(whereStr, {
                                "_id": 0
                            }).toArray(function (err, result) { //查询
                                if (err) {
                                    logger.error("username_verify  dbo.collection  err", err);
                                    throw err;
                                }
                                logger.debug("username_verify  result", result);
                                if (!result.length) {
                                    // db.close();
                                    logger.warn("username_verify  用户名不存在！");
                                    res.end("用户名不存在");
                                } else {
                                    logger.debug("username_verify  用户名已存在");
                                    res.end("用户名已存在");
                                }
                            });
                        });
                    } catch (err) {
                        logger.error("username_verify", err);
                    }
                })
                break;

            case "/login_verify":
                getIp("验证登陆");
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                data = "";
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on("end", function () {
                    try {
                        data = JSON.parse(data);
                        logger.debug("login_verify  data", data);
                        username = data.username
                        if (username === "") {
                            logger.warn("login_verify  用户名不能为空！");
                            res.end("用户名不能为空");
                        }
                        MongoClient.connect(url, {
                            useNewUrlParser: true
                        }, function (err, db) {
                            if (err) {
                                logger.error("login_verify MongoClient.connect  err", err);
                                throw err;
                            }
                            var dbo = db.db("mldn");
                            let whereStr = {
                                "username": username
                            }
                            dbo.collection("site").find(whereStr, {
                                "_id": 0
                            }).toArray(function (err, result) {
                                if (err) {
                                    logger.error("login_verify  dbo.collection  err", err);
                                    throw err;
                                }
                                logger.debug("login_verify  result", result);
                                if (!result.length) {
                                    logger.warn("login_verify  用户名错误！");
                                    res.end("用户名错误");
                                } else {
                                    db_password = result[0].password;
                                    logger.debug("login_verify  db_password", db_password);
                                    if (db_password !== data.pwd) {
                                        logger.warn("login_verify  密码错误！");
                                        res.end("密码错误");
                                    } else {
                                        logger.info("login_verify  验证通过！");
                                        const token = jwt.sign({
                                            user_id: 1, // user_id
                                            username: username // user_name
                                        }, 'zhoushoujian', { // 秘钥
                                            expiresIn: '900s' // 过期时间
                                        });
                                        res.end(token);
                                    }
                                }
                            });
                            // db.close();
                        });
                    } catch (err) {
                        logger.error("login_verify", err);
                    }
                });
                break;

            case "/register_verify":
                getIp("验证注册");
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                data = "",
                    username;
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on("end", function () {
                    try {
                        data = JSON.parse(data);
                        logger.debug("register_verify  data", data);
                        username = data.username
                        if (username === "" || username.length > 32) {
                            logger.debug("register_verify  用户名非法");
                            res.end("用户名非法");
                        }
                        MongoClient.connect(url, {
                            useNewUrlParser: true
                        }, function (err, db) {
                            if (err) {
                                logger.error("register_verify  MongoClient.connect  err", err);
                                throw err;
                            }
                            var dbo = db.db("mldn");
                            dbo.collection("site").find({
                                "username": username
                            }, {
                                "_id": 0
                            }).toArray(function (err, result) {
                                if (result.length) {
                                    logger.warn("register_verify  用户名已存在！")
                                    res.end("用户名已存在");
                                } else {
                                    let insertStr = {
                                        "username": username,
                                        "password": data.pwd
                                    }
                                    logger.debug("register_verify  insertStr", insertStr)
                                    dbo.collection("site").insertOne(insertStr, function (err, result) {
                                        if (err) {
                                            logger.error("register_verify  dbo.collection  err", err);
                                            throw err;
                                        }
                                        logger.debug("register_verify  result", result.result);
                                        // db.close();
                                        res.end("register successs");
                                    });
                                }
                            })
                        });
                    } catch (err) {
                        logger.error("register_verify", err);
                    }
                });
                break;

            case "/forget_pwd":
                getIp("忘记密码");
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                data = "";
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on("end", function () {
                    try {
                        data = JSON.parse(data);
                        logger.debug("forget_pwd data", data);
                        username = data.username
                        if (username === "" || username.length > 32) {
                            logger.warn("forget_pwd 用户名非法");
                            res.end("用户名非法");
                        }
                        MongoClient.connect(url, {
                            useNewUrlParser: true
                        }, function (err, db) {
                            if (err) {
                                logger.error("forget_pwd MongoClient.connect  err", err);
                                throw err;
                            }
                            var dbo = db.db("mldn");
                            let wheretStr = {
                                "username": username
                            }
                            dbo.collection("site").find(wheretStr, {
                                "_id": 0
                            }).toArray(function (err, result) {
                                if (err) {
                                    logger.error("forget_pwd  dbo.collection err", err);
                                    throw err;
                                }
                                logger.debug("forget_pwd  result", result);
                                if (!result.length) {
                                    logger.warn("forget_pwd  用户名不存在");
                                    res.end("用户名不存在");
                                    return;
                                } else {
                                    res.end(result[0].password);
                                }
                                // db.close();
                            });
                        });
                    } catch (err) {
                        logger.error("forget_pwd", err);
                    }
                });
                break;

            case "/sign":
                //响应成功成功的路由
                getIp("登陆成功");
                // res.setHeader('Content-Type', 'text/html;charset=UTF-8');
                // var content = fs.readFileSync("./sign.html");
                // res.write(content);
                res.end();
                break;

            case "/go_sign":
                getIp("验证签到");
                data = "";
                year = new Date().getFullYear();
                month = new Date().getMonth() + 1;
                day = new Date().getDate();
                date = `${year}_${month}_${day}`; //获取服务器当前时间
                logger.debug("go_sign  date", date);
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on("end", function () {
                    try {
                        data = JSON.parse(data);
                        logger.debug("go_sign  data", data);
                        token = data.token;
                        jwt.verify(token, "zhoushoujian", (err, decoded) => {
                            logger.debug('go_sign  正在验证token', decoded);
                            if (err) {
                                logger.error("go_sign  jwt.verify  err", err);
                                //解析token是否过期 和是否是正确的token,若时间长无操作而过期则给出提示
                                if (err.name === "TokenExpiredError" && err.message === "jwt expired") {
                                    logger.warn("go_sign  jwt.verify  身份已过期,请重新登录", getIp("验证签到"));
                                    return res.end("身份已过期,请重新登录");
                                }
                                return res.end("非法登录，即将跳往登录页");
                            } else {
                                username = decoded.username;
                                logger.debug("go_sign  username", username);
                                MongoClient.connect(url, {
                                    useNewUrlParser: true
                                }, function (err, db) {
                                    if (err) {
                                        logger.error("go_sign  MongoClient.connect  err", err);
                                        throw err;
                                    }
                                    var dbo = db.db("mldn");
                                    let whereStr = {
                                        "username": username
                                    }
                                    dbo.collection("site").find(whereStr, {
                                        "_id": 0
                                    }).toArray(function (err, result) {
                                        if (err) {
                                            logger.error("go_sign  dbo.collection err", err);
                                            throw err;
                                        }
                                        logger.debug("go_sign  result", result);
                                        if (!result.length) {
                                            // db.close();
                                            logger.warn("go_sign  用户名不存在！");
                                            return res.end("用户名不存在");
                                        } else {
                                            if (!result[0].date) { //判断有没有签到记录
                                                dbo.collection("site").updateOne({
                                                    "username": username
                                                }, {
                                                    "$push": {
                                                        "date": date
                                                    }
                                                });
                                                // db.close();
                                                //签到后刷新token
                                                const token = jwt.sign({
                                                    user_id: 1,
                                                    username: username
                                                }, 'zhoushoujian', {
                                                    expiresIn: '900s'
                                                });
                                                const sendData = Object.assign({}, {
                                                    "token": token
                                                }, {
                                                    "str": "未签到"
                                                });
                                                logger.info("ip", getIp("验证签到"), "签到成功");
                                                return res.end(JSON.stringify(sendData));
                                            }
                                            let lastDay = result[0].date[result[0].date.length - 1];
                                            logger.debug("go_sign  lastDay", lastDay);
                                            if (lastDay === date) { //判断是不是已经打过卡了
                                                logger.debug("go_sign  已签到");
                                                // db.close();
                                                return res.end(JSON.stringify("已签到"));
                                            } else { //去签到
                                                dbo.collection("site").updateOne({
                                                    "username": username
                                                }, {
                                                    "$push": {
                                                        "date": date
                                                    }
                                                })
                                                // db.close();
                                                //签到后刷新token
                                                const token = jwt.sign({
                                                    user_id: 1,
                                                    username: username
                                                }, 'zhoushoujian', {
                                                    expiresIn: '900s'
                                                });
                                                const sendData = Object.assign({}, {
                                                    "token": token,
                                                    "str": "未签到"
                                                })
                                                logger.info("ip", getIp("验证签到"), "签到成功");
                                                return res.end(JSON.stringify(sendData));
                                            }
                                        }
                                    });
                                });
                            }
                        })
                    } catch (err) {
                        logger.error("go_sign", err);
                    }
                });
                break;

            case "/last_sign":
                getIp("获取最后一次签到时间");
                data = "";
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on("end", function () {
                    try {
                        data = JSON.parse(data);
                        logger.debug("last_sign  data", data);
                        token = data.token;
                        jwt.verify(token, "zhoushoujian", (err, decoded) => {
                            if (err) {
                                logger.error("err", err);
                                //解析token是否过期 和是否是正确的token,若时间长无操作而过期则给出提示
                                if (err.name === "TokenExpiredError" && err.message === "jwt expired") {
                                    logger.warn("last_sign  身份已过期,请重新登录", getIp("获取最后一次签到时间"))
                                    return res.end("身份已过期,请重新登录");
                                }
                                return res.end("非法登录，即将跳往登录页");
                            } else {
                                username = decoded.username;
                                let returnObj = {}; //将要返回给客户端的对象
                                MongoClient.connect(url, {
                                    useNewUrlParser: true
                                }, function (err, db) {
                                    if (err) {
                                        logger.error("last_sign  MongoClient.connect  err", err);
                                        throw err;
                                    }
                                    var dbo = db.db("mldn");
                                    dbo.collection("site").find().toArray(function (err, result) {
                                        if (err) {
                                            logger.error("last_sign dbo.collection  err", err);
                                            throw err;
                                        }
                                        // logger.debug("sign  result", result);
                                        let resultArray = [];
                                        for (let i = 0, l = result.length; i < l; i++) {
                                            if (!result[i].date) {
                                                result[i].date = [];
                                            };
                                            let info = {};
                                            info = Object.assign({}, {
                                                "number": i
                                            }, {
                                                "username": result[i].username
                                            }, {
                                                "date": result[i].date.pop()
                                            });
                                            resultArray.push(info);
                                        }
                                        logger.info("last_sign  resultArray.length", resultArray.length);
                                        Object.assign(returnObj, {
                                            "info": resultArray
                                        });
                                    });
                                    let whereStr = {
                                        "username": username
                                    }
                                    dbo.collection("site").find(whereStr, {
                                        "_id": 0
                                    }).toArray(function (err, result) {
                                        if (err) {
                                            logger.error("last_sign dbo.collection  err", err);
                                            throw err;
                                        }
                                        logger.debug("last_sign  whereStr  result", result);
                                        if (!result[0].date) { //判断是不是没有签到记录
                                            logger.debug("last_sign  未查到历史签到数据");
                                            Object.assign(returnObj, {
                                                "lastDay": "未查到历史签到数据"
                                            });
                                            return res.end(JSON.stringify(returnObj));
                                        }
                                        let lastDay = result[0].date[result[0].date.length - 1];
                                        Object.assign(returnObj, {
                                            "lastDay": lastDay
                                        });
                                        // logger.debug("last_sign  returnObj", returnObj);
                                        res.end(JSON.stringify(returnObj));
                                    });
                                    // db.close();
                                });
                            }
                        })
                    } catch (err) {
                        logger.error("last_sign", err);
                    }
                })
                break;

            default:
                try {
                    //加载静态文件
                    const _render = new Render(req, res);
                    _render.init();
                } catch (err) {
                    logger.error("加载静态文件出错", err)
                }
                break;
        }
    });

    server.listen({
        port: 8080
    });

    server.on('listening', function () {
        console.info(`服务${address}启动成功,正在监听8080端口`);
        process.title = `服务${address}启动成功,正在监听8080端口`;
    });
}
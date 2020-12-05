const http = require('http'),
  path = require('path'),
  MongoClient = require('mongodb').MongoClient, //加载数据库
  Logger = require('beauty-logger'),  // 加载日志
  jwt = require('jsonwebtoken'), // 引入 jwt加载静态文件
  url = 'mongodb://localhost:27017',
  secret = "secret",
  expiresIn = "3600s"

const logger = new Logger({
  logFileSize: 1024 * 1024 * 10,
  logFilePath: path.join(__dirname, "./server.log"),
  dataTypeWarn: true,
  productionModel: false,
  enableMultipleLogFile: false,
});

function mongoSink() {
  return new Promise(res => {
    return MongoClient.connect(url, { useNewUrlParser: true }, async (err, db) => {
      if (err) {
        logger.error("MongoClient.connect  err", err);
        process.exit(1)
      }
      const dbo = db.db("user");
      const model = dbo.collection("info");
      return res(model)
    });
  })

}
mongoSink()
  .then((mongo) => {

    const reportError = (req, res, err) => {
      logger.error('reportError req.url', req.url, "err", err)
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end({ err: err.stack || err.toString() })
    }

    const reportInvokeError = (req, res, err) => {
      logger.error('reportInvokeError req.url', req.url, "err", err)
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ err }))
    }

    const writeResponse = (res, data) => {
      if (Object.prototype.toString.call(data) !== '[object Object]') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        const obj = { "err": "result is not an object" }
        return res.end(JSON.stringify(obj))
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(data))
      }
    }

    let i = 0; //统计api的访问次数
    const server = http.createServer(function (req, res) {
      //允许跨域访问
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, authorization");
      res.setHeader("Access-Control-Expose-Headers", "Authorization");

      logger.debug(`server  收到客户端的请求数量`, req.url, req.method, ++i);
      const url = req.url.split('?')[0]
      if (req.method.toLowerCase() === 'options') {
        res.writeHead(204, { 'Content-Type': 'text/html' });
        return res.end()
      }
      switch (url) { //nodejs路由
        case "/": {
          logger.info('visit root route')
          const obj = { result: Date.now() }
          return writeResponse(res, obj)
        }
        case "/username_verify": {
          if (req.method.toLowerCase() === 'post') {
            // 响应ajax验证用户名
            let data = "";
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                data = JSON.parse(data);
                logger.info("username_verify  data", data);
                const { username } = data;
                return mongo.find({ username }).toArray(function (err, result) { //查询
                  if (err) {
                    logger.error("username_verify  dbo.collection  err", err);
                    return reportError(req, res, err)
                  }
                  logger.debug("username_verify  result", result);
                  if (!result.length) {
                    logger.warn("username_verify  用户名不存在！");
                    return reportInvokeError(req, res, "用户名不存在")
                  } else {
                    const obj = { result: "exist" }
                    return writeResponse(res, obj)
                  }
                });
              } catch (err) {
                logger.error("username_verify", err);
                return reportError(req, res, err)
              }
            })
          }
          break;
        }

        case "/login_verify": {
          if (req.method.toLowerCase() === 'post') {
            let data = "";
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                data = JSON.parse(data);
                logger.info("login_verify  data", data);
                const { username, password } = data
                if (!username) {
                  logger.warn("login_verify  用户名不能为空！");
                  return reportInvokeError(req, res, "用户名不能为空")
                }
                return mongo.find({ username }).toArray(function (err, result) {
                  if (err) {
                    logger.error("login_verify  dbo.collection  err", err);
                    return reportError(req, res, err)
                  }
                  logger.debug("login_verify  result", result);
                  if (!result.length) {
                    logger.warn("login_verify  用户名不存在");
                    return reportInvokeError(req, res, "用户名不存在")
                  } else {
                    const dbPassword = result[0].password;
                    logger.debug("login_verify  dbPassword", dbPassword);
                    if (dbPassword !== password) {
                      logger.warn("login_verify  密码错误！");
                      return reportInvokeError(req, res, "密码错误")
                    } else {
                      logger.info("login_verify  验证通过！");
                      const token = jwt.sign({
                        user_id: 1, // user_id
                        username // user_name
                      }, secret, { // 秘钥
                        expiresIn // 过期时间
                      });
                      const response = {
                        username,
                        token
                      }
                      const obj = { result: response }
                      return writeResponse(res, obj)
                    }
                  }
                });
              } catch (err) {
                logger.error("login_verify", err);
                return reportError(req, res, err)
              }
            });
          }
          break;
        }

        case "/register_verify": {
          if (req.method.toLowerCase() === "post") {
            let data = "";
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                data = JSON.parse(data);
                logger.info("register_verify  data", data);
                const { username, password } = data
                if (!username || username.length > 32) {
                  logger.warn("register_verify  用户名非法");
                  return reportInvokeError(req, res, "用户名非法")
                }
                return mongo.find({ username }).toArray(function (err, result) {
                  if (err) {
                    logger.error("register_verify mongo.find  err", err);
                    return reportError(req, res, err)
                  }
                  if (result.length) {
                    logger.warn("register_verify  用户名已存在！")
                    return reportInvokeError(req, res, "用户名已存在")
                  } else {
                    const insertStr = {
                      username,
                      password
                    }
                    logger.info("register_verify  insertStr", insertStr)
                    return mongo.insertOne(insertStr, function (err, result) {
                      if (err) {
                        logger.error("register_verify mongo.insertOne err", err);
                        return reportError(req, res, err)
                      }
                      logger.debug("register_verify  result", result.result);
                      const obj = { result: "success" }
                      return writeResponse(res, obj)
                    });
                  }
                })
              } catch (err) {
                logger.error("register_verify", err);
                return reportError(req, res, err)
              }
            });
          }
          break;
        }

        case "/forget_pwd": {
          if (req.method.toLowerCase() === "post") {
            let data = "";
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                data = JSON.parse(data);
                logger.info("forget_pwd data", data);
                const { username } = data
                if (!username || username.length > 32) {
                  logger.warn("forget_pwd 用户名非法");
                  return reportInvokeError(req, res, "用户名非法")
                }
                return mongo.find({ username }).toArray(function (err, result) {
                  if (err) {
                    logger.error("forget_pwd  dbo.collection err", err);
                    return reportError(req, res, err)
                  }
                  logger.debug("forget_pwd  result", result);
                  if (!result.length) {
                    logger.warn("forget_pwd  用户名不存在");
                    return reportInvokeError(req, res, "用户名不存在")
                  } else {
                    const obj = { result: result[0].password }
                    return writeResponse(res, obj)
                  }
                });
              } catch (err) {
                logger.error("forget_pwd", err);
                return reportError(req, res, err)
              }
            });
          }
          break;
        }

        case "/go_sign":
          if (req.method.toLowerCase() === "post") {
            let data = "";
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const day = new Date().getDate();
            const date = `${year}_${month}_${day}`; //获取服务器当前时间
            logger.info("go_sign  date", date);
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                logger.debug("go_sign  data", data);
                const token = req.headers.authorization
                return jwt.verify(token, secret, (err, decoded) => {
                  logger.debug('go_sign  正在验证token', decoded);
                  if (err) {
                    logger.error("go_sign  jwt.verify  err", err);
                    //解析token是否过期 和是否是正确的token,若时间长无操作而过期则给出提示
                    if (err.name === "TokenExpiredError" && err.message === "jwt expired") {
                      logger.warn("go_sign  jwt.verify  身份已过期,请重新登录");
                      return reportInvokeError(req, res, "身份已过期,请重新登录")
                    }
                    return reportInvokeError(req, res, "非法登录，即将跳往登录页")
                  } else {
                    const username = decoded.username;
                    logger.info("go_sign  username", username);
                    return mongo.find({ username }).toArray(function (err, result) {
                      if (err) {
                        logger.error("go_sign  dbo.collection err", err);
                        return reportError(req, res, err)
                      }
                      logger.debug("go_sign  result", result);
                      if (!result.length) {
                        logger.warn("go_sign  用户名不存在！");
                        return reportInvokeError(req, res, "用户名不存在")
                      } else {
                        if (!result[0].date) { //判断有没有签到记录
                          return mongo.updateOne({ username }, { "$push": { date } }, { upsert: true }, () => {
                            //签到后刷新token
                            const token = jwt.sign({ user_id: 1, username }, secret, { expiresIn });
                            const sendData = { token, status: "未签到" }
                            logger.info("go_sign 签到成功");
                            const obj = { result: sendData }
                            return writeResponse(res, obj)
                          });
                        }
                        const lastDay = result[0].date[result[0].date.length - 1];
                        logger.debug("go_sign  lastDay", lastDay);
                        if (lastDay === date) { //判断是不是已经打过卡了
                          logger.debug("go_sign  已签到");
                          const obj = { result: { status: "已签到" } }
                          return writeResponse(res, obj)
                        } else { //去签到
                          return mongo.updateOne({ username }, { "$push": { date } }, { upsert: true }, () => {
                            //签到后刷新token
                            const token = jwt.sign({ user_id: 1, username }, secret, { expiresIn });
                            const sendData = Object.assign({}, {
                              token,
                              status: "未签到"
                            })
                            logger.info("ip", "签到成功");
                            const obj = { result: sendData }
                            return writeResponse(res, obj)
                          })
                        }
                      }
                    });
                  }
                })
              } catch (err) {
                logger.error("go_sign", err);
                return reportError(req, res, err)
              }
            });
          }
          break;

        case "/last_sign":
          if (req.method.toLowerCase() === "post") {
            let data = "";
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                logger.info("last_sign  data", data);
                const token = req.headers.authorization
                jwt.verify(token, secret, (err, decoded) => {
                  if (err) {
                    //解析token是否过期 和是否是正确的token,若时间长无操作而过期则给出提示
                    if (err.name === "TokenExpiredError" && err.message === "jwt expired") {
                      logger.warn("last_sign  身份已过期,请重新登录")
                      return reportInvokeError(req, res, "身份已过期,请重新登录")
                    }
                    return reportInvokeError(req, res, "非法登录，即将跳往登录页")
                  } else {
                    const username = decoded.username;
                    return mongo.find({ username }).toArray(function (err, result) {
                      if (err) {
                        logger.error("last_sign dbo.collection  err", err);
                        return reportError(req, res, err)
                      }
                      logger.debug("last_sign  whereStr  result", result);
                      if (!result[0].date) { //判断是不是没有签到记录
                        logger.debug("last_sign  未查到历史签到数据");
                        const obj = { result: "未查到历史签到数据" }
                        return writeResponse(res, obj)
                      }
                      const lastDay = result[0].date[result[0].date.length - 1];
                      logger.debug("last_sign  lastDay", lastDay);
                      const obj = { result: lastDay }
                      return writeResponse(res, obj)
                    });
                  }
                })
              } catch (err) {
                logger.error("last_sign", err);
                return reportError(req, res, err)
              }
            })
          }
          break;

        case "/sign_persons": {
          if (req.method.toLowerCase() === "post") {
            let data = "";
            req.on('data', function (chunk) {
              data += chunk;
            });
            req.on("end", function () {
              try {
                logger.info("sign_case data", data);
                const token = req.headers.authorization
                jwt.verify(token, secret, (err, _decoded) => {
                  if (err) {
                    logger.error("sign_persons jwt.verify err", err);
                    //解析token是否过期 和是否是正确的token,若时间长无操作而过期则给出提示
                    if (err.name === "TokenExpiredError" && err.message === "jwt expired") {
                      logger.warn("last_sign  身份已过期,请重新登录")
                      return reportInvokeError(req, res, "身份已过期,请重新登录")
                    }
                    return reportInvokeError(req, res, "非法登录，即将跳往登录页")
                  } else {
                    return mongo.find({}).toArray(function (err, result) {
                      if (err) {
                        logger.error("last_sign dbo.collection  err", err);
                        return reportError(req, res, err)
                      }
                      // logger.debug("sign  result", result);
                      const resultArray = [];
                      for (let i = 0, l = result.length; i < l; i++) {
                        if (!result[i].date) {
                          result[i].date = [];
                        }
                        const info = {
                          "number": i,
                          "username": result[i].username,
                          "date": result[i].date.pop()
                        }
                        resultArray.push(info);
                      }
                      logger.info("last_sign  resultArray.length", resultArray.length);
                      const obj = { result: resultArray }
                      return writeResponse(res, obj)
                    });
                  }
                })
              } catch (err) {
                logger.error("forget_pwd", err);
                return reportError(req, res, err)
              }
            });
          }
          break;
        }

        default:
          logger.warn('no route matched, req.url, req.method', req.url, req.method)
          return reportInvokeError(req, res, { err: 'no route matched' })
      }
    });

    server.listen({
      port: 8080
    });

    server.on('listening', function () {
      console.info(`服务localhost启动成功,正在监听8080端口`);
      process.title = `服务localhost启动成功,正在监听8080端口`;
    });
  })

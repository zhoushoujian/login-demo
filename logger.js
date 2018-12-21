//made by zhoushoujian on 2018/12/13
let fs = require('fs'),
    time,
    list = [],
    LOG_FILE_MAX_SIZE = 1024 * 1024 * 5,
    LOGGER_LEVEL = ["debug", "info", "warn", "error"];

//自定义控制台打印颜色
{
    let colors = {
        Reset: "\x1b[0m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m"
    };
    let length = 0;
    "debug:debug:FgBlue,info::FgGreen,warn:警告:FgYellow,error:error:FgRed".split(",").forEach(function (logcolor) {
        let [log, info, color] = logcolor.split(':');
        let logger = function (...args) {
            let message = args.join(" ");
            console.log("");
            process.stdout.write("\b \b".repeat(length << 1) + message);
            length = message.length;
        } || console[log] || console.log;
        console[log] = (...args) => {
            let logData=[],flag;
            args.forEach((arg,i,arr) => {
                if(Object.prototype.toString.call(arg) === "[object Object]"){
                    flag = true;
                    arg = JSON.stringify(arg, function (key, value) {
                        return value;
                    }, 4);
                } else if (Object.prototype.toString.call(arg) === "[object Null]"){
                    flag = true;
                    arg = "null";
                }
                logData.push(arg);
            });
            if(flag){
               return  logger.apply(null, [`[${getTime()}]  ${colors[color]}[${info.toUpperCase()||log.toUpperCase()}]${colors.Reset}`, logData, colors.Reset]);
            };
            return logger.apply(null, [`[${getTime()}]  ${colors[color]}[${info.toUpperCase()||log.toUpperCase()}]${colors.Reset}`, ...args, colors.Reset]);
        }
    });
}


function getTime() {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    let second = new Date().getSeconds();
    let mileSecond = new Date().getMilliseconds();
    if (hour < 10) {
        hour = "0" + hour
    }
    if (minute < 10) {
        minute = "0" + minute
    }
    if (second < 10) {
        second = "0" + second
    }
    if (mileSecond < 10) {
        second = "00" + mileSecond
    }
    if (mileSecond < 100) {
        second = "0" + mileSecond
    }
    time = `${year}-${month}-${day} ${hour}:${minute}:${second}.${mileSecond}`;
    return time;
}

function activate() {
    let buffer = list.shift();
    excute(buffer).then(
        function () {
            if (list.length > 0) {
                activate();
            }
        }
    );
}

function excute(buffer) {
    return new Promise((resolve, reject) => {
            fs.stat("./server.log", function (err, stats) {
                if (err) {
                    if (!fs.existsSync("./server.log")) {
                        fs.appendFileSync("./server.log");
                    }
                    resolve();
                } else {
                    return new Promise((resolve, reject) => {
                            if (stats.size > LOG_FILE_MAX_SIZE) {
                                fs.readdir("/", (err, files) => {
                                    if (err) throw err
                                    let fileList = files.filter(function (file) {
                                        return /^server[0-9]*\.log$/i.test(file);
                                    });
                                    for (let i = fileList.length; i > 0; i--) {
                                        if (i >= 10) {
                                            fs.unlinkSync("/" + fileList[i - 1]);
                                            continue;
                                        }
                                        fs.renameSync("/" + fileList[i - 1], "server" + i + ".log");
                                    }
                                });
                                resolve();
                            } else {
                                resolve();
                            }
                        })
                        .then(resolve)
                        .catch(resolve);
                }
            })
        })
        .then(() => {
            return new Promise(function (res, rej) {
                fs.writeFileSync("server.log", buffer, {
                    flag: "a+"
                });
                res();
            })
        })
}

function doLogInFile(buffer) {
    buffer && list.push(buffer) && activate();
}

/**
 * 初始化日志方法
 * @param {*} InitLogger
 */
function InitLogger() {
    //  console.log("初始化日志系统   ok");
}

function loggerInFile(level, data, ...args) {
    let extend = [];
    args.map(arg => {
        // console.log("arg",Object.prototype.toString.call(arg));
        switch (Object.prototype.toString.call(arg)) {
            case '[object Object]':
                arg = JSON.stringify(arg, function (key, value) {
                    return value;
                }, 4);
                break;
            case '[object Function]':
            case '[object Number]':
            case '[object Boolean]':
            case '[object String]':
                break;
            case '[object Null]':
                arg = 'null';
                break;
            default:
                arg = JSON.stringify(arg);
                break;
        }
        // console.log("arg000",arg);
        if (Object.prototype.toString.call(arg) === '[object Array]') {
            extend = arg;
        } else {
            extend.push(arg);
        }
    });
    if (extend.length) {
        extend = `  [ext] ${extend}`;
    } else {
        extend = "";
    }
    // console.log("extend",extend);
    if (Object.prototype.toString.call(data) === '[object Null]') {
        data = "Null";
    } else if(Object.prototype.toString.call(data) === '[object Object]'){
        data = JSON.stringify(data, function (key, value) {
            return value;
        }, 4);
    } else if (Object.prototype.toString.call(data) === '[object Undefined]'){
        data = "";
    }
    let strLog = `[${getTime()}]  [${level.toUpperCase()}]` + ` ${data}` + `${extend}`;
    let content = strLog + "\r\n";
    console[level](data + extend);
    doLogInFile(content);
}

LOGGER_LEVEL.reduce(function (total, level, cx) {
    InitLogger.prototype[level] = function (data, ...args) {
        loggerInFile(level, data, ...args);
    }
}, [])

module.exports = global.logger = new InitLogger(); //实例化日志函数
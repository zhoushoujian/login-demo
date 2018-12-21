require("./logger");
const str="this is string";
const num = 0;
const bool = false;
const empty = null;
const arr = [1,2,3];
const obj = {
	"a":str,
	"b":num
};
const undefine = undefined;
const func = function(a,b){
	let sum = a+b;
	return sum; 
};

//所有的类型为undefined的都不显示

//单参数用例
{
	// logger.debug(str);
	// logger.debug(num);
	// logger.info(bool);
	// logger.info(empty);
	// logger.warn(arr);
	// logger.warn(obj);
	// logger.error(undefine);
	// logger.error(func);

	// console.log("\r\n\r\n------------------这是一道神奇的分割线-------------------------");
	// // 下面的不会打印到日志文件
	// console.debug(str);
	// console.debug(num);
	// console.info(bool);
	// console.info(empty);
	// console.warn(arr);
	// console.warn(obj);
	// console.error(undefine);
	// console.error(func);
}

//双参数用例
{
	console.log("*********************双参数用例***************************************");
logger.debug("这是双参数用例",str);
logger.debug("这是双参数用例",num);
logger.info("这是双参数用例",bool);
logger.info("这是双参数用例",empty);
logger.warn("这是双参数用例",arr);
logger.warn("这是双参数用例",obj);
logger.error("这是双参数用例",undefine);
logger.error("这是双参数用例",func);

console.log("\r\n\r\n------------------这是一道神奇的分割线-------------------------");
// 下面的不会打印到日志文件
console.debug("这是双参数用例",str);
console.debug("这是双参数用例",num);
console.info("这是双参数用例",bool);
console.info("这是双参数用例",empty);
console.warn("这是双参数用例",arr);
console.warn("这是双参数用例",obj);
console.error("这是双参数用例",undefine);
console.error("这是双参数用例",func);
}

//四参数用例
{
	// console.log("*********************四参数用例***************************************");
	// logger.debug("这是四参数用例", str, "this is string", str);
	// logger.debug("这是四参数用例", num, "this is number", num);
	// logger.info("这是四参数用例", bool, "this is bool", bool);
	// logger.info("这是四参数用例", empty, "this is null", empty);
	// logger.warn("这是四参数用例", arr, "this is array", arr);
	// logger.warn("这是四参数用例", obj, "this is obj", obj);
	// logger.error("这是四参数用例", undefine, "this is undefined", undefine);
	// logger.error("这是四参数用例", func, "this is no args function", func);

	// // console.log("\r\n\r\n------------------这是一道神奇的分割线-------------------------");
	// // 下面的不会打印到日志文件
	// console.debug("这是四参数用例", str, "this is string", str);
	// console.debug("这是四参数用例", num, "this is number", num);
	// console.info("这是四参数用例", bool, "this is bool", bool);
	// console.info("这是四参数用例", empty, "this is null", empty);
	// console.warn("这是四参数用例", arr, "this is array", arr);
	// console.warn("这是四参数用例", obj, "this is obj", obj);
	// console.error("这是四参数用例", undefine, "this is undefined", undefine);
	// console.error("这是四参数用例", func, "this is no args function", func);
}



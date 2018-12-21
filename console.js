{
    let colors = {
        Reset: "\x1b[0m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m"
    };
    let length = 0;
    "info:info:FgGreen,warn:warning:FgYellow,error:error:FgRed".split(",").forEach(function (logcolor) {
        let [log, info, color] = logcolor.split(':');
        let logger = function (...args) {
            let message = args.join(" ");
            process.stdout.write("\b \b".repeat(length << 1) + message);
            length = message.length;
        } || console[log] || console.log;
        console[log] = (...args) => logger.apply(null, [`${colors[color]}${info || log}${colors.Reset}`, ...args,colors.Reset]);
    });
}
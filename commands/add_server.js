var cmd = {}

cmd.name = "addserver";
cmd.role = "owner";
cmd.group = "Monitoring";
cmd.use = "addserver [ip] [port] [name]";
cmd.desc = "Add a server to the monitor for status.";

var checkIP = (ip) => {
 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) return true;
}

var checkPort = (port) => {
    var int = parseInt(port);

    if (int === NaN) return false;

    return (int >= 30120 && int <= 31000);
}

cmd.run = async (bot, msg, args, guild) => {
    var ip = args[0];
    var port = args[1];

    if (!ip) return embedReply(msg, "error", ":x: You must specify the server ip.");
    if (!port) return embedReply(msg, "error", ":x: You must specify the server port.");

    if (!checkIP(ip)) return embedReply(msg, "error", ":x: You must specify a valid server ip.");
    if (!checkPort(port)) return embedReply(msg, "error", ":x: You must specify a valid server port.");

    delete args[0];
    delete args[1];

    args = cleanArray(args);

    var name = args.join(" ");

    msg.session.servers = msg.session.servers || {};

    if (msg.session.servers[ip + ":" + port]) return embedReply(msg, "error", ":x: This server is already in the list.");

    msg.session.servers[ip + ":" + port] = name;

    embedReply(msg, "success", ":white_check_mark: Added ``" + ip + ":" + port + " (" + name + ")`` to the server monitor.").then(m=>m.delete(4000));
    saveData();
}

module.exports = cmd;


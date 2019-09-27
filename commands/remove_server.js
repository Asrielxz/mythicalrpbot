var cmd = {}

cmd.name = "removeserver";
cmd.role = "owner";
cmd.group = "Monitoring";
cmd.use = "removeserver [ip] [port]";
cmd.desc = "Remove a server from the monitor.";

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

    msg.session.servers = msg.session.servers || {};

    if (!msg.session.servers[ip + ":" + port]) return embedReply(msg, "error", ":x: This server is not in the list.");

    delete msg.session.servers[ip + ":" + port];

    msg.session.servers = cleanArray(msg.session.servers);

    embedReply(msg, "success", ":white_check_mark: Removed ``" + ip + ":" + port + "`` from the server monitor.").then(m=>m.delete(4000));
    saveData();
}

module.exports = cmd;


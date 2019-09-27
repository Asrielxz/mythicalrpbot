var cmd = {}

cmd.name = "listservers";
cmd.role = "user";
cmd.group = "Monitoring";
cmd.use = "listservers";
cmd.desc = "Lists the servers in the monitor.";

cmd.run = async (bot, msg, args, guild) => {
    msg.session.servers = msg.session.servers || {};

    var str = "";

    for (var srv in msg.session.servers) {
        var r = msg.session.servers[srv];

        if (str !== "") {
            str += "\n";
        }

        str += "**" + r + "**\n" + "``" + srv + "``";
    }

    if (str == "") {
        str = "No servers available.";
    }

    embedReply(msg, "info", str).then(m=>m.delete(25000));
    saveData();
}

module.exports = cmd;


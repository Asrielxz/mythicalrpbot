var cmd = {}

cmd.name = "setupstatus";
cmd.role = "user";
cmd.group = "Monitoring";
cmd.use = "setupstatus";
cmd.desc = "Sets up the status monitor for the servers.";

cmd.run = async (bot, msg, args, guild) => {
    msg.session.servers = msg.session.servers || {};
    msg.session.status = msg.session.status || {}

    if (msg.session.status.channelID && msg.session.status.messageID) {
        var c = msg.guild.channels.find(c => c.id == msg.session.status.channelID);

        if (c) {
            var m = await c.fetchMessage(msg.session.status.messageID);

            if (m) {
                m.delete();
                log("info", "Removed existing message in " + c.name);
            }
        }
    }

    var chan = msg.channel;

    msg.session.status.channelID = chan.id;

    var embed = await embedServerList(msg);

    if (!embed) return;

    msg.channel.send(embed).then(mc => {
        msg.session.status.messageID = mc.id;
        saveData();
    })

    // var str = "";

    // for (var srv in msg.session.servers) {
    //     var r = msg.session.servers[srv];

    //     if (str !== "") {
    //         str += "\n";
    //     }

    //     str += "**" + r + "**\n" + "``" + srv + "``";
    // }

    // if (str == "") {
    //     str = "No servers available.";
    // }

    // embedReply(msg, "info", str).then(m=>m.delete(25000));
    // saveData();
}

module.exports = cmd;


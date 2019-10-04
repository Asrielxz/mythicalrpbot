var cmd = {}

cmd.name = "setuplinks";
cmd.role = "owner";
cmd.group = "Monitoring";
cmd.use = "setuplinks [info]";
cmd.desc = "Sets up the server links for the discord.";

cmd.run = async (bot, msg, args, guild) => {
    args = args.join(" ");
    args = args.split("\n");
    msg.session.links = msg.session.links || {};

    if (msg.session.links.channelID && msg.session.links.messageID) {
        var c = msg.guild.channels.find(c => c.id == msg.session.rules.channelID);

        if (c) {
            var m = await c.fetchMessage(msg.session.links.messageID);

            if (m) {
                m.delete();
                log("info", "Removed existing message in " + c.name);
            }
        }
    }

    var chan = msg.channel;

    // msg.session.links.llist = [];

    // for (var str in args) {
    //     var rule = args[str];
    //     str = rule.replace("\n", "");
    //     msg.session.rules.rlist.push(rule);
    // }

    msg.session.rules.channelID = chan.id;

    // var header = msg.settings.rules_header;

    // var embed = await embedRules(header, msg.session.rules.rlist);

    var e = embed();
    e.setColor(0x671cff);
    e.setTitle("Server Links");

    var str = "";
    for (var rule of args) {
        str += `${rule}`;
        if (str !== "") {
            str += "\n";
        }
    }

    for (var srv in msg.session.servers) {
        var name = msg.session.servers[srv];
        e.addField(name, srv)
    }

    e.setDescription(str);

    // if (!embed) return;

    msg.channel.send(e).then(mc => {
        msg.session.links.messageID = mc.id;
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


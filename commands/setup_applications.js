var cmd = {}

cmd.name = "setupapplications";
cmd.role = "owner";
cmd.group = "Monitoring";
cmd.use = "setupapplications [info]";
cmd.desc = "Sets up the server applications for the discord.";

cmd.run = async (bot, msg, args, guild) => {
    msg.session.apps = msg.session.apps || {};

    if (msg.session.apps.channelID && msg.session.apps.messageID) {
        var c = msg.guild.channels.find(c => c.id == msg.session.rules.channelID);

        if (c) {
            var m = await c.fetchMessage(msg.session.apps.messageID);

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
    e.setTitle("Server Applications");

    var str = "";
    for (var i = 0; i < args.length; i++) {
        if (args[i] && args[i + 1]) {
            e.addField(args[i] + " Application", "[Application Link](" + args[i + 1] + ")");
            i++;
        }
    }

    e.setDescription(msg.settings.applications_header);

    // if (!embed) return;

    msg.channel.send(e).then(mc => {
        msg.session.apps.messageID = mc.id;
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


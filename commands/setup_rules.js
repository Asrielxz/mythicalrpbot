var cmd = {}

cmd.name = "setuprules";
cmd.role = "owner";
cmd.group = "Monitoring";
cmd.use = "setuprules [rules]";
cmd.desc = "Sets up the server rules for the discord.";

cmd.run = async (bot, msg, args, guild) => {
    args = args.join(" ");
    args = args.split("\n");
    msg.session.rules = msg.session.rules || {};

    if (msg.session.rules.channelID && msg.session.rules.messageID) {
        var c = msg.guild.channels.find(c => c.id == msg.session.rules.channelID);

        if (c) {
            var m = await c.fetchMessage(msg.session.rules.messageID);

            if (m) {
                m.delete();
                log("info", "Removed existing message in " + c.name);
            }
        }
    }

    var chan = msg.channel;

    msg.session.rules.rlist = [];

    for (var str in args) {
        var rule = args[str];
        str = rule.replace("\n", "");
        msg.session.rules.rlist.push(rule);
    }

    msg.session.rules.channelID = chan.id;

    var header = msg.settings.rules_header;

    var embed = await embedRules(header, msg.session.rules.rlist);

    if (!embed) return;

    msg.channel.send(embed).then(mc => {
        msg.session.rules.messageID = mc.id;
        saveData();
    });
}

module.exports = cmd;


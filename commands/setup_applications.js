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

    msg.session.rules.channelID = chan.id;

    var e = embed();
    e.setColor(msg.settings.info_color);
    e.setTitle("Server Applications");

    var str = "";
    for (var i = 0; i < args.length; i++) {
        if (args[i] && args[i + 1]) {
            e.addField(args[i] + " Application", "[Application Link](" + args[i + 1] + ")");
            i++;
        }
    }

    e.setDescription(msg.settings.applications_header);

    msg.channel.send(e).then(mc => {
        msg.session.apps.messageID = mc.id;
        saveData();
    });
}

module.exports = cmd;


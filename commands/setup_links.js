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

    msg.session.rules.channelID = chan.id;

    var e = embed();
    e.setColor(msg.settings.info_color);
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

    msg.channel.send(e).then(mc => {
        msg.session.links.messageID = mc.id;
        saveData();
    });
}

module.exports = cmd;


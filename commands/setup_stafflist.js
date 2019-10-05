var cmd = {}

cmd.name = "setupstafflist";
cmd.role = "owner";
cmd.group = "Monitoring";
cmd.use = "setupstafflist";
cmd.desc = "Sets up the staff list for the discord.";

cmd.run = async (bot, msg, args, guild) => {
    msg.session.stafflist = msg.session.stafflist || {}

    if (msg.session.stafflist.channelID && msg.session.stafflist.messageID) {
        var c = msg.guild.channels.find(c => c.id == msg.session.stafflist.channelID);

        if (c) {
            var m = await c.fetchMessage(msg.session.stafflist.messageID);

            if (m) {
                m.delete();
                log("info", "Removed existing message in " + c.name);
            }
        }
    }

    var chan = msg.channel;

    msg.session.stafflist.channelID = chan.id;

    var embed = await embedStaffList(msg);

    if (!embed) return;

    msg.channel.send(embed).then(mc => {
        msg.session.stafflist.messageID = mc.id;
        saveData();
    })
}

module.exports = cmd;


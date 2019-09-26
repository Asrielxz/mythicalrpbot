var cmd = {}

cmd.name = "unmute";
cmd.role = "mod";
cmd.group = "Moderation";
cmd.use = "unmute [@user] [(optional) reason]";
cmd.desc = "Unmute a user in the guild if they are muted.";

cmd.run = async (bot, msg, args, guild) => {
    if (!msg.mentions.members || msg.mentions.members.size < 1) {
        return embedReply(msg, "error", ":x: You must mention a user to mute.").then(m => m.delete(2500));
    }

    var who = msg.mentions.members.first();
    if (who) {
        args[0] = "";
    }

    var myPower = getUserPowerLevel(msg.member);
    var theirPower = getUserPowerLevel(who);

    if (theirPower > myPower) {
        return embedReply(msg, "error", ":x: You cannot target this person.").then(m => m.delete(2500));
    }

    var reason = args.join(" ");

    if (!reason || reason.length == 0 || reason == " ") {
        reason = "No reason available.";
    }

    var data = msg.data;

    // data.mutes[who.id] = 0{ guild: msg.guild.id, time: Date.now() + (secs * 1000), by: msg.who, reason: reason };
    // save("data.json", data);
    var ret = await removeMute(who.id).catch(e => {
        return log("error", `Failed to unmute user ${msg.author.id}, reason: ${e}`);
    });
    var e = embed();
    e.setTitle("User Unmuted");
    e.setColor(0xf45042);
    e.addField("Who", `<@${who.id}>`, true);
    e.addField("By", `<@${msg.author.id}>`, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);

    if (ret == 1) {
        return embedReply(msg, "error", `:x: <@${who.id}> is not muted.`).then(m => m.delete(4000));
    } else if (ret == 0) {
        embedReply(msg, "success", `:speaker: <@${who.id}> has been unmuted.`).then(m => m.delete(4000));

        var r = guild.roles.find(r => r.name == msg.settings.mute_role);

        if (!r) {
            return embedReply(msg, "error", ":x: There is no valid mute role for this guild check the settings file and make sure the role specified exists!").then(m => m.delete(4000));
        } else {
            who.removeRole(r, `UNMUTE: ${reason} (@${msg.author.name}#${msg.author.discriminator})`);
            var ue = embed();
            ue.setTitle("You have been unmuted");
            ue.setColor(0xf45042);
            ue.addField("Server", `\`\`${guild.name}\`\``, true);
            ue.addField("By", `<@${msg.author.id}>`, true);
            ue.addField("Reason", `\`\`${reason}\`\``, true);

            who.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));
        }
    }

    modLog(msg, e);
}

module.exports = cmd;


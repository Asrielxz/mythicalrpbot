var cmd = {}

cmd.name = "mute";
cmd.role = "mod";
cmd.group = "Moderation";
cmd.use = "mute [@user] [duration (optional) (1h, 1m, 1s)] [(optional) reason]";
cmd.desc = "Mute a user in the guild for a duration if specified.";

cmd.run = async (bot, msg, args, guild) => {
    if (!msg.mentions.members || msg.mentions.members.size < 1) {
        return embedReply(msg, "error", ":x: You must mention a user to mute.").then(m => m.delete(2500));
    }

    var who = msg.mentions.members.first();
    if (who) {
        delete args[0];
    }

    var myPower = getUserPowerLevel(msg.member);
    var theirPower = getUserPowerLevel(who);

    if (theirPower >= myPower) {
        return embedReply(msg, "error", ":x: You cannot target this person.").then(m => m.delete(2500));
    }

    var timestring = args[1];
    if (!timestring) {
        return embedReply(msg, "error", ":x: You must specify a time to mute for.").then(m => m.delete(2500));
    }
    var int = timestring.slice(0, timestring.length - 1);
    var appendage = timestring.slice(timestring.length - 1, timestring.length);

    int = parseInt(int);
    if (!isValidTimeAppendage(appendage)) {
        return embedReply(msg, "error", ":x: You must specify a valid time format!").then(m => m.delete(2500));
    }
    var data = getSecondsFromTimeString(int, appendage);
    var secs = data.secs;

    if (!isNaN(secs)) {
        delete args[1];
    }
    var str = getFormatFromSeconds(secs);
    if (isNaN(secs) && isNaN(int)) {
        secs = 0;
        str = "indefinitely";
    }

    var reason = args.join(" ");

    if (!reason || reason.length == 0 || reason == " ") {
        reason = "No reason available.";
    }

    var data = msg.data;

    // data.mutes[who.id] = 0{ guild: msg.guild.id, time: Date.now() + (secs * 1000), by: msg.who, reason: reason };
    // save("data.json", data);
    var ret = await addMute(msg.guild.id, who.id, (Date.now() + (secs * 1000)), msg.who, reason).catch(e => {
        return log("error", `Failed to mute user ${who.id}, reason: ${e}`);
    });
    var e = embed();
    e.setTitle("User Muted");
    e.setColor(0xf45042);
    e.addField("Who", `<@${who.id}>`, true);
    e.addField("By", `<@${msg.author.id}>`, true);
    e.addField("Duration", `\`\`${str}\`\``, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);

    if (ret == 1) {
        embedReply(msg, "success", `:alarm_clock: <@${who.id}> was already muted. I have set their mute duration to the new one.`).then(m => m.delete(4000));
    } else if (ret == 0) {
        embedReply(msg, "success", `:mute: <@${who.id}> has been muted.`).then(m => m.delete(4000));
    }
    var r = guild.roles.find(r => r.name == msg.settings.mute_role);

    if (!r) {
        return embedReply(msg, "error", ":x: There is no valid mute role for this guild check the settings file and make sure the role specified exists!").then(m => m.delete(4000));
    } else {
        who.addRole(r, `MUTE: ${reason} (@${msg.author.name}#${msg.author.discriminator}) for (${str})`);
        var ue = embed();
        ue.setTitle("You have been muted");
        ue.setColor(0xf45042);
        ue.addField("Server", `\`\`${guild.name}\`\``, true);
        ue.addField("By", `<@${msg.author.id}>`, true);
        ue.addField("Duration", `\`\`${str}\`\``, true);
        ue.addField("Reason", `\`\`${reason}\`\``, true);

        who.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));
    }

    modLog(msg, e);
}

module.exports = cmd;


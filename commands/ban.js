const ms = require("ms");
var cmd = {}
cmd.name = "ban";
cmd.role = "admin";
cmd.group = "Moderation";
cmd.use = "ban [@user] [duration (1h, 1m, 1s)] [(optional) reason]";
cmd.desc = "Ban a user from the guild for a duration with a reason if specified.";

cmd.run = async (bot, msg, args, guild) => {
    if (!msg.mentions.members || msg.mentions.members.size < 1) {
        return embedReply(msg, "error", ":x: You must mention a user to ban.").then(m => m.delete(2500));
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

    var timeStr = args[1];
    if (!timeStr || timeStr.length < 1) {
        return embedReply(msg, "error", ":x: You must put a duration to ban for.").then(m => m.delete(2500));
    }
    var milliseconds = ms(timeStr);
    var secs = 0;

    var str = "";

    if (milliseconds) {
        delete args[1];
        secs = milliseconds / 1000;
        str = ms(milliseconds, { long: true });
    }

    args = cleanArray(args);

    if (milliseconds < 0) {
        return embedReply(msg, "error", ":x: The ban duration can not be a negative value.").then(m => m.delete(2500));
    }

    var reason = args.join(" ");

    if (!reason || reason.length == 0 || reason == " ") {
        reason = "No reason available.";
    }

    if (secs == 0) {
        str = "indefinitely";
    }

    if (!who.bannable) {
        return embedReply(msg, "error", ":x: I cannot ban this user.").then(m => m.delete(2500));
    }
    if (secs > 0) {
        var ret = await addBan(msg.guild.id, who.id, (Date.now() + milliseconds), msg.who, reason).catch(e => {
            return log("error", `Failed to ban user ${who.id}, reason: ${e}`);
        });
    }
    await who.ban({ days: 7, reason: reason });
    var e = embed();
    e.setTitle("User Banned");
    e.setColor(0xf45042);
    e.addField("Who", `<@${who.id}>`, true);
    e.addField("By", `<@${msg.author.id}>`, true);
    e.addField("Duration", `\`\`${str}\`\``, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);

    embedReply(msg, "success", `:hammer: <@${who.id}> has been banned.`).then(m => m.delete(4000));
    var ue = embed();
    ue.setTitle("You have been banned");
    ue.setColor(0xf45042);
    ue.addField("Server", `\`\`${guild.name}\`\``, true);
    ue.addField("By", `<@${msg.author.id}>`, true);
    ue.addField("Duration", `\`\`${str}\`\``, true);
    ue.addField("Reason", `\`\`${reason}\`\``, true);

    who.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));

    modLog(msg, e);
}

module.exports = cmd;


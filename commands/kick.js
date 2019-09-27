var cmd = {}

cmd.name = "kick";
cmd.role = "mod";
cmd.group = "Moderation";
cmd.use = "kick [@user] [(optional) reason]";
cmd.desc = "Kick a user from the guild for a reason if specified.";

cmd.run = async (bot, msg, args, guild) => {
    if (!msg.mentions.members || msg.mentions.members.size < 1) {
        return embedReply(msg, "error", ":x: You must mention a user to mute.").then(m => m.delete(2500));
    }

    var who = msg.mentions.members.first();
    if (who) {
        delete args[0];
    }

    args = cleanArray(args);

    var myPower = getUserPowerLevel(msg.member);
    var theirPower = getUserPowerLevel(who);

    if (theirPower >= myPower) {
        return embedReply(msg, "error", ":x: You cannot target this person.").then(m => m.delete(2500));
    }

    var reason = args.join(" ");

    if (!reason || reason.length == 0 || reason == " ") {
        reason = "No reason available.";
    }

    await who.kick(reason);
    var e = embed();
    e.setTitle("User Kicked");
    e.setColor(0xf45042);
    e.addField("Who", `<@${who.id}>`, true);
    e.addField("By", `<@${msg.author.id}>`, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);

    embedReply(msg, "success", `:door: <@${who.id}> has been kicked.`).then(m => m.delete(4000));
    var ue = embed();
    ue.setTitle("You have been kicked");
    ue.setColor(0xf45042);
    ue.addField("Server", `\`\`${guild.name}\`\``, true);
    ue.addField("By", `<@${msg.author.id}>`, true);
    ue.addField("Reason", `\`\`${reason}\`\``, true);

    who.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));

    modLog(msg, e);
}

module.exports = cmd;


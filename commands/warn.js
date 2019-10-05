var cmd = {}

cmd.name = "warn";
cmd.role = "mod";
cmd.group = "Moderation";
cmd.use = "warn [@user] [reason]";
cmd.desc = "Warn a user with a reason.";

cmd.run = async (bot, msg, args, guild) => {
    if (!msg.mentions.members || msg.mentions.members.size < 1) {
        return embedReply(msg, "error", ":x: You must mention a user to warn.").then(m => m.delete(2500));
    }

    var who = msg.mentions.members.first();
    if (who) {
        delete args[0];
    }

    var myPower = getUserPowerLevel(msg.member);
    var theirPower = getUserPowerLevel(who);

    if (theirPower >= myPower) {
        // return embedReply(msg, "error", ":x: You cannot target this person.").then(m => m.delete(2500));
    }

    var reason = args.join(" ");
    if (!reason || reason.length == 0 || reason == " ") {
        return embedReply(msg, "error", ":x: You must specify a reason to warn for.").then(m => m.delete(2500));
    }

    msg.session.warns = msg.session.warns || {};
    msg.session.warns[who.id] = msg.session.warns[who.id] || [];

    var w = msg.session.warns[who.id];

    var when = Date();

    when = when.replace(" GMT+0000 (Coordinated Universal Time)", "");

    w.push({
        id: w.length + 1,
        reason: reason,
        admin: msg.author.id,
        when: when
    })

    saveData();

    var e = embed();
    e.setTitle("User Warned");
    e.setColor(msg.settings.error_color);
    e.addField("Who", `<@${who.id}>`, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);
    e.addField("By", `<@${msg.author.id}>`, true);
    e.addField("When", `\`\`${when}\`\``, true);

        embedReply(msg, "success", `:warning: <@${who.id}> has been warned.`).then(m => m.delete(4000));

        var ue = embed();
        ue.setTitle("You have been warned");
        ue.setColor(msg.settings.error_color);
        ue.addField("Server", `\`\`${guild.name}\`\``, true);
        ue.addField("Reason", `\`\`${reason}\`\``, true);
        ue.addField("By", `<@${msg.author.id}>`, true);
        ue.addField("When", `\`\`${when}\`\``, true);

        who.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));

    modLog(msg, e);
}

module.exports = cmd;


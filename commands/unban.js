const ms = require("ms");
var cmd = {}
cmd.name = "unban";
cmd.role = "admin";
cmd.group = "Moderation";
cmd.use = "unban [userid] [(optional) reason]";
cmd.desc = "Unban a user if banned with a reason if specified.";

cmd.run = async (bot, msg, args, guild) => {
    var who = args[0];

    if (who) {
        delete args[0];
    }

    var i = parseInt(who);

    var reason = args.join(" ");

    if (!reason || reason.length == 0 || reason == " ") {
        reason = "No reason available.";
    }

    var bans = await msg.guild.fetchBans(true);

    var isBanned = false;
    var rb;
    var ru;

    for (var ban of bans) {
        ban = ban[1];

        var usr = ban.user;

        if (usr.id == who) {
            isBanned = true;
            rb = ban;
            ru = usr;
            break;
        }
    }

    args = cleanArray(args);

    if (!isBanned) {
        return embedReply(msg, "error", `:x: <@${who}> is not banned.`).then(m => m.delete(4000));
    } else {
        var ret = await removeBan(who).catch(e => {
            return log("error", `Failed to unban user ${who}, reason: ${e}`)
        });

        msg.guild.unban(ru, reason);

        var e = embed();
        e.setTitle("User Unbanned");
        e.setColor(msg.settings.success_color);
        e.addField("Who", `<@${who}>`, true);
        e.addField("By", `<@${msg.author.id}>`, true);
        e.addField("Ban Reason", `\`\`${rb.reason}\`\``, true);
        e.addField("Unban Reason", `\`\`${reason}\`\``, true);

        embedReply(msg, "success", `:hammer: <@${who}> has been unbanned.`).then(m => m.delete(4000));

        modLog(msg, e);
    }
}

module.exports = cmd;


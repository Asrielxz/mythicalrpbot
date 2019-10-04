var cmd = {}

cmd.name = "warns";
cmd.role = "user";
cmd.group = "Utility";
cmd.use = "warns [(optional) @user]";
cmd.desc = "Display all the warnings you have received.";

cmd.run = async (bot, msg, args, guild) => {
    var who = msg.mentions.members.first();
    if (who) {
        delete args[0];
    }

    var myPower = getUserPowerLevel(msg.member);
    var neededPower = getRolePowerLevel(msg.settings.roles.mod);

    if (neededPower > myPower && who) {
        return embedReply(msg, "error", ":x: You cannot view other peoples warnings.").then(m => m.delete(2500));
    }

    msg.session.warns = msg.session.warns || {};

    var warns = msg.session.warns[who ? who.id : msg.author.id];

    var dobreak = false;

    if (who) {
        if (!warns || warns.length <= 0) {
            return embedReply(msg, "error", ":x: This person has no warnings.");
        } else {
            var e = embed();
            e.setColor(0xf45042);
            e.setTitle("Their Warnings");
            e.setTimestamp();

            for (var i = 0; i < warns.length; i++) {
                var e = embed();
                e.setColor(0xf45042);
                e.setTitle("Their Warnings");
                e.setTimestamp();

                var w = warns[i];
                e.addField("ID", "``" + w.id + "``", true);
                e.addField("Reason", "``" + w.reason + "``", true);
                e.addField("Admin", "<@" + w.admin + ">", true);
                e.addField("When", "``" + w.when + "``", true);
                msg.author.send(e).catch(e => {
                    return embedReply(msg, "error", ":x: I could not send you a DM containing their warnings.").then(m => m.delete(2500));
                    dobreak = true;
                })
            }

            if (dobreak) return;
            embedReply(msg, "success", ":mailbox: I have sent you a DM containing their warnings.").then(m => m.delete(2500));

        }
    } else {
        if (!warns || warns.length <= 0) {
            return embedReply(msg, "error", ":x: You have no warnings.");
        } else {
            for (var i = 0; i < warns.length; i++) {
                if (dobreak) break;
                var e = embed();
                e.setColor(0xf45042);
                e.setTitle("Your Warnings");
                e.setTimestamp();

                var w = warns[i];
                e.addField("ID", "``" + w.id + "``", true);
                e.addField("Reason", "``" + w.reason + "``", true);
                e.addField("Admin", "<@" + w.admin + ">", true);
                e.addField("When", "``" + w.when + "``", true);
                msg.author.send(e).catch(e => {
                    return embedReply(msg, "error", ":x: I could not send you a DM containing your warnings.").then(m => m.delete(2500));
                    dobreak = true;
                })
            }

            if (dobreak) return;
            embedReply(msg, "success", ":mailbox: I have sent you a DM containing your warnings.").then(m => m.delete(2500));

        }
    }
}

module.exports = cmd;


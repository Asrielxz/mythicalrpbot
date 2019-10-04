var cmd = {}

cmd.name = "remove";
cmd.role = "support";
cmd.group = "Utility";
cmd.use = "remove [(optional) #ticket] [@user] [(optional) reason]";
cmd.desc = "Remove a user to a ticket so they no longer have access.";

cmd.run = async (bot, msg, args, guild) => {

    var chan = {};

    if (msg.mentions.channels && msg.mentions.channels.size > 0) {
        chan = msg.mentions.channels.first();
        delete args[0];
        args = cleanArray(args);
    }

    var user = {};

    if (msg.mentions.members && msg.mentions.members.size > 0) {
        user = msg.mentions.members.first();
        delete args[0];
        args = cleanArray(args);
    }

    if (!user.id) {
        return embedReply(msg, "error", ":x: You must specify a user to remove from the ticket.").then(m=>m.delete(3000));
    }

    var reason = args.join(" ");

        if (!reason || reason == "" || reason == " ") {
        reason = "No reason available."
    }

    msg.session.tickets = msg.session.tickets || {};

    var tmpc = msg.channel.id;

    var ticketData = {};

    for (var userd in msg.session.tickets) {
        var ticket = msg.session.tickets[userd];

        if (chan.id && ticket.channel == chan.id) {
            ticketData = ticket;
            break;
        } else if (!chan.id) {
            if (tmpc == ticket.channel) {
                ticketData = ticket;
                break;
            }
        }
    }

    var isOwn = ticketData.user == msg.author.id;

    var myPower = getUserPowerLevel(msg.member);
    var neededPower = getRolePowerLevel(msg.settings.roles.support);

    if (neededPower > myPower) {
        return embedReply(msg, "error", ":x: You cannot remove people from tickets.").then(m => m.delete(2500));
    }

    var when = Date();

    when = when.replace(" GMT+0000 (Coordinated Universal Time)", "");

    if (!ticketData || !ticketData.channel) return embedReply(msg, "error", ":x: No ticket to remove this person from.").then(m=>m.delete(3000));

    var c = msg.guild.channels.find(ch => ch.id == ticketData.channel);

    if (!c) return embedReply(msg, "error", ":x: Failed to find the channel for the ticket. You may have corrupted data, contact an admin if this issue persists.").then(m=>m.delete(3000));

    var cperms = c.permissionsFor(user);

    if (!cperms.has("SEND_MESSAGES")) return embedReply(msg, "error", ":x: This user does not have access to this channel.").then(m=>m.delete(3000));

    c.overwritePermissions(user, {
        "SEND_MESSAGES": false,
        "READ_MESSAGES": false
    });

    var e = embed();
    e.setTitle("User Removed From Ticket");
    e.setColor(0xf45042);
    e.addField("Ticket", `<#${ticketData.channel}>`, true);
    e.addField("Ticket Owner", `<@${ticketData.user}>`, true);
    e.addField("User", `<@${user.id}>`, true);
    e.addField("Admin", `<@${msg.author.id}>`, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);
    e.addField("When", `\`\`${when}\`\``, true);

    modLog(msg, e);

    // if (msg.channel.id !== ticketData.channel && !msg.channel.deleted) {
        embedReply(msg, "success", ":white_check_mark: <@" + user.id + "> Has been removed from the ticket.").then(m=>m.delete(3000));
    // }
}

module.exports = cmd;
var cmd = {}

cmd.name = "close";
cmd.role = "user";
cmd.group = "Utility";
cmd.use = "close [(optional) #ticket] [(optional) reason]";
cmd.desc = "Closes a ticket if you have one, or closes someone elses ticket.";

cmd.run = async (bot, msg, args, guild) => {

    var chan = {};

    if (msg.mentions.channels && msg.mentions.channels.size > 0) {
        chan = msg.mentions.channels.first();
        delete args[0];
        args = cleanArray(args);
    }

    var reason = args.join(" ");

        if (!reason || reason == "" || reason == " ") {
        reason = "No reason available."
    }

    msg.session.tickets = msg.session.tickets || {};

    var tmpc = msg.channel.id;

    var ticketData = {};

    for (var user in msg.session.tickets) {
        var ticket = msg.session.tickets[user];

        if (chan.id && ticket.channel == chan.id) {
            ticketData = ticket;
            break;
        } else if (!chan.id) {
            if (tmpc == ticket.channel) {
                ticketData = ticket;
                break;
            }
        }

        if (!ticketData) {
            if (ticket.user == msg.author.id) {
                ticketData = ticket;
                break;
            }
        }
    }

    var isOwn = ticketData.user == msg.author.id;

    if (!isOwn) {
        var myPower = getUserPowerLevel(msg.member);
        var neededPower = getRolePowerLevel(msg.settings.roles.support);

        if (neededPower > myPower) {
            return embedReply(msg, "error", ":x: You cannot close other peoples tickets.").then(m => m.delete(2500));
        }
    }

    var when = Date();

    when = when.replace(" GMT+0000 (Coordinated Universal Time)", "");

    if (!ticketData || !ticketData.channel) return embedReply(msg, "error", ":x: No ticket to close.").then(m=>m.delete(3000));

    var c = msg.guild.channels.find(ch => ch.id == ticketData.channel);

    delete msg.session.tickets[ticketData.user];

    msg.session.tickets = cleanArray(msg.session.tickets);

    saveData();

    if (!c) return embedReply(msg, "error", ":x: Failed to find the channel for the ticket. You may have corrupted data, contact an admin if this issue persists.").then(m=>m.delete(3000));

    var e = embed();
    e.setTitle("Ticket Closed");
    e.setColor(msg.settings.error_color);
    e.addField("Who", `<@${ticketData.user}>`, true);
    e.addField("By", `<@${msg.author.id}>`, true);
    e.addField("Reason", `\`\`${reason}\`\``, true);
    e.addField("Topic", `\`\`${ticketData.topic}\`\``, true);
    e.addField("When", `\`\`${when}\`\``, true);

    c.delete();

    var to = msg.guild.members.find(m => m.id == ticketData.user);

    if (to) {
        to.send("Your ticket ``" + ticketData.name + "`` has been closed. Below attached is the chatlog if you require it for further assistance.").catch(e => {});
        var logFile = await getLog(to);
        if (!logFile) return;
        to.send({
            files: [
                logFile
            ]
        }).catch(e => {}).then(_ => {
            setTimeout(() => {
                clearLog(msg.author);
            }, 2000);
        })
    }

    ticketLog(msg, e);

    if (msg.channel.id !== ticketData.channel && !msg.channel.deleted) {
        embedReply(msg, "success", ":white_check_mark: The ticket has been closed successfully.").then(m=>m.delete(3000));
    }
}

module.exports = cmd;


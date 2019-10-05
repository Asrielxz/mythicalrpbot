var cmd = {}

cmd.name = "new";
cmd.role = "user";
cmd.group = "Utility";
cmd.use = "new [topic]";
cmd.desc = "Create a new ticket with a topic.";

cmd.run = async (bot, msg, args, guild) => {
    var topic = args.join(" ");

    if (!topic || topic == "" || topic == " ") {
        topic = "No topic available."
    }

    var ticketCategory = msg.guild.channels.find(c => c.name == msg.settings.ticket_category);

    if (!ticketCategory) {
        return embedReply(msg, "error", ":x: Could not find ticket category channel. Report this issue if it persists.").then(m=>m.delete(7000));
    }

    if (msg.channel.name !== msg.settings.ticket_channel) {
        return embedReply(msg, "error", ":x: You can only make tickets in the #" + msg.settings.ticket_channel + " channel.").then(m=>m.delete(4500));
    }

    msg.session.tickets = msg.session.tickets || {};

    if (msg.session.tickets[msg.author.id]) {
        var c = msg.session.tickets[msg.author.id].channel;
        c = await msg.guild.channels.find(ch => ch.id == c);
        if (c) return embedReply(msg, "error", ":x: You cannot open a new ticket with one open already. Please close it to open a new one.").then(m=>m.delete(5000));
    }

    msg.session.tickets[msg.author.id] = msg.session.tickets[msg.author.id] || [];

    var when = Date();

    when = when.replace(" GMT+0000 (Coordinated Universal Time)", "");

    msg.session.tickets[msg.author.id] = {
        topic: topic,
        user: msg.author.id,
        opened: when
    };

    var ticketID = await getTicketID(msg.session.tickets);

    setupLog(msg.author, "ticket-" + ticketID);

    var ticket = await msg.guild.createChannel("ticket-" + ticketID, {
        type: "text",
        name: "ticket-" + ticketID,
        position: 1,
        topic: topic,
        parent: ticketCategory
    });

    msg.session.tickets[msg.author.id].channel = ticket.id;
    msg.session.tickets[msg.author.id].name = "ticket-" + ticketID;

    setupLog(msg.author, "ticket-" + ticketID);

    ticket.overwritePermissions(msg.guild.roles.find(r => r.name == "@everyone"), {
        "SEND_MESSAGES": false,
        "READ_MESSAGES": false,
        "VIEW_CHANNEL": false
    });

    ticket.overwritePermissions(msg.author, {
        "SEND_MESSAGES": true,
        "READ_MESSAGES": true
    });

    ticket.overwritePermissions(msg.guild.roles.find(r => r.name == msg.settings.roles.support), {
        "SEND_MESSAGES": true,
        "READ_MESSAGES": true
    });

    saveData();

    var e = embed();
    e.setTitle("New Ticket Opened");
    e.setColor(msg.settings.info_color);
     e.addField("Ticket", `<#${ticket.id}>`, true);
    e.addField("Who", `<@${msg.author.id}>`, true);
    e.addField("Topic", `\`\`${topic}\`\``, true);
    e.addField("When", `\`\`${when}\`\``, true);

    embedReply(msg, "success", `:white_check_mark: <@${msg.author.id}> Your ticket has been created. You can view it by clicking <#${ticket.id}>`).then(m => m.delete(4000));

    var ue = embed();
    ue.setTitle("Ticket Information");
    ue.setColor(msg.settings.info_color);
    ue.addField("Topic", "``" + topic + "``", true);
    ue.addField("Opened By", "<@" + msg.author.id + ">", true);
    ue.addField("Opened On", "``" + when + "``", true);
    ticket.send(ue);

    ticketLog(msg, e);
}

module.exports = cmd;


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

    var reason = args.join(" ");
    if (!reason || reason.length == 0 || reason == " ") {
        return embedReply(msg, "error", ":x: You must specify a reason to warn for.").then(m => m.delete(2500));
    }

    msg.session.tickets = msg.session.tickets || {};
    msg.session.tickets[who.id] = msg.session.tickets[who.id] || [];

    var t = msg.session.tickets[who.id];

    var when = Date();

    when = when.replace(" GMT+0000 (Coordinated Universal Time)", "");

    t.push({
        id: t.length + 1,
        topic: topic,
        user: msg.author.id,
        opened: when
    })

    saveData();

    var e = embed();
    e.setTitle("New Ticket");
    e.setColor(0xf45042);
    e.addField("Who", `<@${msg.author.id}>`, true);
    e.addField("Topic", `\`\`${topic}\`\``, true);
    e.addField("When", `\`\`${when}\`\``, true);

        embedReply(msg, "success", `:warning: <@${who.id}> has been warned.`).then(m => m.delete(4000));

        var ue = embed();
        ue.setTitle("You have been warned");
        ue.setColor(0xf45042);
        ue.addField("Server", `\`\`${guild.name}\`\``, true);
        ue.addField("Reason", `\`\`${reason}\`\``, true);
        ue.addField("By", `<@${msg.author.id}>`, true);
        ue.addField("When", `\`\`${when}\`\``, true);

        who.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));

    modLog(msg, e);
}

module.exports = cmd;


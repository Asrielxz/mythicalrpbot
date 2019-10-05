var cmd = {}

cmd.name = "announce";
cmd.role = "admin";
cmd.group = "Utility";
cmd.use = "announce [title] [message]";
cmd.desc = "Makes an annoucement with the bot.";

cmd.run = async (bot, msg, args, guild) => {
    var title = args[0];

    if (!title) {
        title = "Server Annoucement";
    } else {
        delete args[0];
        args = cleanArray(args);
    }

    var str = args.join(" ");

    if (!str || str == "" || str == " ") {
        return embedReply(msg, "error", `:x: You can not make a blank annoucement.`).then(m => m.delete(4000));
    }

    if (!title || title == "" || title == " ") {
        title = "Server Annoucement";
    }

    title = title.split("-").join(" ");

    var e = embed();
    e.setTitle(title);
    e.setColor(msg.settings.info_color);
    e.setDescription(str);
    msg.channel.send(e);
}

module.exports = cmd;


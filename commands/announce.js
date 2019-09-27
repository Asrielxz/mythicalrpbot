var cmd = {}

cmd.name = "announce";
cmd.role = "admin";
cmd.group = "Utility";
cmd.use = "announce [message]";
cmd.desc = "Makes an annoucement with the bot.";

cmd.run = async (bot, msg, args, guild) => {
    var str = args.join(" ");

    if (!str || str == "" || str == " ") {
        return embedReply(msg, "error", `:x: You can not make a blank annoucement.`).then(m => m.delete(4000));
    }

    var e = embed();
    e.setTitle("Server Annoucement");
    e.setColor(0xb342f5);
    e.setDescription(str);
    msg.channel.send(e);
}

module.exports = cmd;


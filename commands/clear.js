var cmd = {}

cmd.name = "clear";
cmd.role = "mod";
cmd.group = "Moderation";
cmd.use = "clear [amount (min: 1, max: 100)] [(optional) @user]";
cmd.desc = "Clear a certain amount of (a users) messages from a channel.";

cmd.run = async (bot, msg, args, guild) => {
    var amount = parseInt(args[0]);

    if (!isNaN(amount)) {
        if (amount < 1) {
            return embedReply(msg, "error", ":x: You must enter a number greater than 1.").then(m => m.delete(2500));
        } else if (amount > 100) {
            return embedReply(msg, "error", ":x: You must enter a number less than 100.").then(m => m.delete(2500));
        }

        var user = undefined;

        if (msg.mentions.members && msg.mentions.members.size > 0) {
            user = msg.mentions.members.first();
        }

        msg.channel.fetchMessages({ limit: amount }).then(messages => {
            if (user) {
                msg.channel.bulkDelete(messages.filter(mess => mess.author.id === user.id));
                return embedReply(msg, "success", ":white_check_mark: Cleared ``" + amount + "`` messages.").then(m => m.delete(4500));
            } else {
                msg.channel.bulkDelete(messages);
                return embedReply(msg, "success", ":white_check_mark: Cleared ``" + amount + "`` messages.").then(m => m.delete(4500));
            }
        })
    } else {
        return embedReply(msg, "error", ":x: You must enter an amount to clear.").then(m => m.delete(2500));
    }
}

module.exports = cmd;


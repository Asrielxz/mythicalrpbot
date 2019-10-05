var cmd = {}

cmd.name = "help";
cmd.role = "user";
cmd.group = "Utility";
cmd.use = "help";
cmd.desc = "Display all available bot commands.";

cmd.run = async (bot, msg, args, guild) => {
    var help = {};
    var scope = args[0];

    for (cmd in getCmds()) {
        var c = getCmds()[cmd];
        if (c.group) {
            help[c.group] = help[c.group] || [];
            help[c.group].push(c);
        }
    }

    var e = embed();
    e.setColor(msg.settings.info_color);
    var t = Date.now() + 5000;

    if (scope) {
        e.setAuthor(`${msg.settings.server_name} Help`, guild.iconURL);
        e.setTimestamp();
        e.setFooter(`${bot.user.username} | Issued by: @${msg.author.username}#${msg.author.discriminator}`)

        if (getCmds()[scope] && getCmds()[scope].group) {
            var c = getCmds()[scope];
            e.addField(scope, `${c.desc}\n\`\`${msg.settings.prefix}${c.use}\`\``);
            msg.channel.send(e).then(m => m.delete(10000));
        } else {
            embedReply(msg, "error", ":x: There is no command ``" + scope + "``").then(m => m.delete(2000));
        }
        return;
    }

    e.setAuthor(`${msg.settings.server_name} Command List`, guild.iconURL);
    var rep = "";
    for (cat in help) {
        rep = "";
        for (cmd of help[cat]) {
            if (cmd.name && cmd.use && cmd.desc && cmd.group) {
                rep += `**${cmd.name}** *${cmd.role}*\n`;
                rep += `${cmd.desc}\n`;
                rep += `\`\`${msg.settings.prefix}${cmd.use}\`\`\n`
            }
        }
        e.addField(cat, rep);
    }
    msg.channel.send(e).then(m => m.delete(20000));
}

module.exports = cmd;


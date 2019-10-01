const util = require("./lib/util.js"); // Require util from lib for helper functions.
const repl = require('repl'); // REPL is used to have node.js input.
const chalk = require("chalk"); // Require chalk for console markup.
// Helper function loader
global["log"] = util.env["log"]; // Define the global logger for other uses.

for (var f in util.env) { // Loop through everything in the env object.
    global[f] = util.env[f]; // Define the env in the global object.
    log("info", `Loaded env function '${f}'`);
}

for (var d in util.data) { // Loop through everything in the data object.
    global[d] = util.data[d]; // Define the data in the global object.
    log("info", `Loaded global '${d}'`);
}

for (var d in util.run) { // Loop through everything in the run object.
    util.run[d](); // Run the function for preload.
    log("info", `Ran function '${d}'`);
}
// End of helper function loader.
var entry = async () => { // Entry function for startup.
    var settings = await load("settings.json"); // Load settings file.

    var data = await load("data.json") // Load all data for guild.
    var bot = client(); // Setup client for bot.
    await think(); // Setup the thinker timeout.
    thinkAdd("data_think", async () => {
        if (typeof onLoad == "function") { // Check if onLoad is a function
            var ret = onLoad(data, settings); // Get return value of onLoad(data, settings)
            if (ret.data) {
                data = ret.data; // if onLoad(data, settings) returned ret.data set the current data as that.
                bot.data = data;
            }
            if (ret.settings) {
                settings = ret.settings; // if onLoad(data, settings) returned ret.settings set the current settings as that.
                bot.settings = settings;
            }
        }
    });

    thinkAdd("mute_think", async () => {
        for (var user in data.mutes) {
            var mdata = data.mutes[user];
            var server = mdata.guild;
            var guild = bot.guilds.find(g => g.id == server);
            if (guild) {
                var member = guild.members.find(m => m.id == user);

                if (member) {
                    var time_left = mdata.time - Date.now();

                    if (Math.floor(time_left) <= 0) {
                        var role = guild.roles.find(r => r.name == settings.mute_role);
                        if (role) {
                            member.removeRole(role, "[AUTO] Mute expired.");
                            var ue = embed();
                            ue.setTitle("You have been unmuted");
                            ue.setColor(0x42f45f);
                            ue.addField("Server", `\`\`${guild.name}\`\``, true);
                            ue.addField("By", `<@${bot.user.id}>`, true);
                            ue.addField("Reason", `\`\`[AUTO] Mute expired.\`\``, true);
                            member.send(ue).catch(err => log("error", `Failed to DM user: ${err}`));
                            var c = guild.channels.find(c => c.name == settings.mod_log);
                            if (c) {
                                ue = embed();
                                ue.setTitle("User Unmuted");
                                ue.setColor(0x42f45f);
                                ue.addField("Who", `<@${member.id}>`, true);
                                ue.addField("By", `<@${bot.user.id}>`, true);
                                ue.addField("Reason", `\`\`[AUTO] Mute expired.\`\``, true);
                                c.send(ue);
                            } else {
                                log("error", `${guild.name} does not contain a mod log channel.`);
                            }
                            log("info", `Mute expired for ${member.id} (${member.displayName}) in ${guild.name}`);
                        } else {
                            log("error", "No mute role for guild " + guild.name);
                        }
                        removeMute(user);
                    }
                } else {
                    log("error", `Could not find muted member in guild. ${user}`);
                    removeMute(user);
                }
            } else {
                log("error", `Could not find guild in bot list. ${server}`);
                removeMute(user);
            }
        }
    });

    thinkAdd("ban_think", async () => {
        for (var user in data.bans) {
            var bdata = data.bans[user];
            var server = bdata.guild;
            var why = bdata.reason;
            var guild = bot.guilds.find(g => g.id == server);
            if (guild) {
                var banned = guild.fetchBan(user);

                if (banned) {
                    var time_left = bdata.time - Date.now();

                    if (Math.floor(time_left) <= 0) {
                        guild.unban(user).then(m => {
                            log("info", `Ban expired for ${user} (@${m.username}#${m.discriminator}) in ${guild.name} (Ban Reason: ${why})`);
                        })
                        var c = guild.channels.find(c => c.name == settings.mod_log);
                        if (c) {
                            ue = embed();
                            ue.setTitle("User Unbanned");
                            ue.setColor(0x42f45f);
                            ue.addField("Who", `<@${user}>`, true);
                            ue.addField("By", `<@${bot.user.id}>`, true);
                            ue.addField("Ban Reason", `\`\`${why}\`\``, true);
                            ue.addField("Reason", `\`\`[AUTO] Ban expired.\`\``, true);
                            c.send(ue);
                        } else {
                            log("error", `${guild.name} does not contain a mod log channel.`);
                        }
                        removeBan(user);
                    }
                } else {
                    log("error", `User is not banned in guild. ${user}`);
                    removeBan(user);
                }
            } else {
                log("error", `Could not find guild in bot list. ${server}`);
                removeBan(user);
            }
        }
    });

    thinkAdd("status_think", async () => {
        for (var srv in data.session) {
            var dat = data.session[srv];

            if (dat.status && dat.status.channelID && dat.status.messageID) {
                var guild = bot.guilds.find(g => g.id == srv);

                if (guild) {
                    if (!dat.status.cooldown) {
                        dat.status.cooldown = 60;
                        saveData();
                    }
                    dat.status.cooldown--;
                    saveData();
                    if (dat.status.cooldown <= 0) {
                        dat.status.cooldown = undefined;
                        var chan = guild.channels.find(c => c.id == dat.status.channelID);

                        if (chan) {
                            fetchMessageDetour(chan, dat.status.messageID, async (m) => {
                                var fake = {
                                    session: dat
                                }

                                var embed = await embedServerList(fake);

                                if (m) {
                                    m.edit(embed);
                                } else {
                                    chan.send(embed).then(m => {
                                        dat.status.messageID = m.id;
                                        saveData();
                                    })
                                }
                            });
                        } else {
                            delete data.session[srv];
                            data.session = cleanArray(data.session);
                            saveData();
                            log("error", "Could not find channel for status thinker. " + guild.name);
                        }
                    }
                }
            }
        }
    });

    on("message", (message) => { // Message event to run everytime the bot intercepts a message.
        if (message.author.bot) return; // Do nothing if message author is a bot.
        var d = parseString(message.content); // Parse the command and arguments for the message if it has any.
        var cmd = d.command; // Setup command string from data.
        var args = d.args; // Setup arguments array from data.
        if (cmd) { // if the command is there continue.
            if (!message.guild || message.dm) return embedReply(message, "error", ":x: You cannot send commands in a DM.");
            data.session[message.guild.id] = data.session[message.guild.id] || {}; // Setup session guild.
            message.data = data; // Setup reference to data for message.
            message.settings = settings; // Setup reference to settings for message.
            message.session = data.session[message.guild.id]; // Setup reference to session data for message.
            message.bot = bot; // Setup reference to bot for message.
            message.who = message.author.id; // Setup reference to author id for message.

            var cmds = getCmds(); // Get all the registered commands.

            if (cmds[cmd]) { // Check if the command entered is a valid one.
                var canRun = canUserRunCommand(message.member, cmds[cmd]); // Check if the user has permission to run the command if neccessary.
                if (canRun) { // if they can run the command
                    message.delete(); // Delete their message so it doesn't show in the channel sent.
                    try { // Use a try to run the code without exiting if an error is occured.
                        log("misc", `${chalk.bgBlack.whiteBright(message.author.username + "#" + message.author.discriminator)} (${chalk.bgBlack.whiteBright(message.author.id)}) ran command ${chalk.bgBlack.cyanBright(cmd)} with arguments: ${chalk.bgBlack.blueBright((args.join(" ") !== "" ? args.join(" ") : "none"))}`); // Log in console the command that was ran.
                        cmds[cmd].run(bot, message, args, message.guild).catch(err => {
                            embedReply(message, "warn", ":exclamation: Command ``" + cmd + "`` failed to run: ```js\n" + err + "```"); // Lets the user know the command failed.
                            log("error", "Command " + cmd + " failed to run: " + err + " (trace: " + err.stack + ")"); // Log the error if it happens.
                        }); // Use the run function the command has,
                    } catch (err) { // Catches if command has error and continues execution.
                        embedReply(message, "warn", ":exclamation: Command ``" + cmd + "`` failed to run: ```js\n" + err + "```"); // Lets the user know the command failed.
                        log("error", "Command " + cmd + " failed to run: " + err + " (trace: " + err.stack + ")"); // Log the error if it happens.
                    }
                } else { // User cannot use the command.
                    return embedReply(message, "error", ":x: You do not have permission to use the command ``" + cmd + "``"); // Let them know they don't have permissions.
                }
            }
        }
    })

    log("info", "Logging into bot with token.");

    await login(settings.token); // Login to the bot with our token.
    setTimeout(
        () => {
            repl.start({
                prompt: 'eval>',
                eval: function(cmd, context, filename, callback) {
                    var ret = eval(cmd);
                    callback(ret);
                }
            })
        }, 1000);
}

entry(); // Begin the entry function.


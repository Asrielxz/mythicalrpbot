const chalk = require("chalk");
const fs = require("fs");
const discord = require("discord.js");
const cmd = require("./cmd.js");

var cl;
var globals = {};

function getRandomItem(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}

// angloDuration :: Int -> String
function angloDuration(intSeconds) {
    return zip(
        weekParts(intSeconds),
        ['week', 'day', 'hour', 'minute', 'second']
    )
        .reduce(function(a, x) {
            return a.concat(x[0] ? (
                [(x[0].toString() + ' ' + x[1] + (x[0] > 1 ? "s" : ""))]
            ) : []);
        }, [])
        .join(', ');
}

function weekParts(intSeconds) {

    return [undefined, 7, 24, 60, 60]
        .reduceRight(function(a, x) {
            var intRest = a.remaining,
                intMod = isNaN(x) ? intRest : intRest % x;

            return {
                remaining: (intRest - intMod) / (x || 1),
                parts: [intMod].concat(a.parts)
            };
        }, {
            remaining: intSeconds,
            parts: []
        })
        .parts
}

function zip(xs, ys) {
    return xs.length === ys.length ? (
        xs.map(function(x, i) {
            return [x, ys[i]];
        })
    ) : undefined;
}

global_manager = {
    get(v, d) {
        return globals[v] || d;
    },
    set(v, d) {
        globals[v] = d;
        return globals[v];
    },
    async load(f) {
        var e = fs.existsSync(f);
        if (e) {
            return JSON.parse(fs.readFileSync(f, "utf8"));
        } else {
            fs.writeFileSync(f, "[]");
            return [];
        }
    },
    async save(f, d) {
        fs.writeFileSync(f, JSON.stringify(d));
    }
}
var thinkers = [];

async function think() {
    for (var name in thinkers) {
        var f = thinkers[name];

        var ret = await f();
        if (ret && ret != undefined) {
            if (typeof ret == "function") {
                ret = await ret();
            }
            log("info", `Thinker ${name} has fufilled request. ${ret}`)
            delete thinkers[name];
        }
    }
    return setTimeout(think, 1000);
}

function thinkAdd(n, f) {
    thinkers[n] = f;
}

function thinkRemove(n, f) {
    delete thinkers[n];
}

function log(typ, msg) {
    var c = chalk.magentaBright;
    var s = "MISC";
    switch (typ) {
        case "info":
            s = "INFO";
            c = chalk.blue;
            break;
        case "warn":
            s = "WARN";
            c = chalk.orange;
            break;
        case "error":
            s = "ERROR";
            c = chalk.red;
            break;
        case "success":
            s = "SUCCESS";
            c = chalk.green;
            break;
        case "misc":
            s = "MISC";
            c = chalk.magentaBright;
            break;
        default:
            msg = typ;
            s = "?";
            c = chalk.brown;
            break;
    }
    console.log(`${c(s)} ${msg}`)
}

var settings_;
var data_;

function getPowers() {
    var powers = {};
    var pindx = 1;

    for (var role in settings_.roles) {
        var c = settings_.roles[role];
        powers[c] = pindx;
        pindx++;
    }

    return powers;
}

function getUserPowerLevel(author) {
    var powers = getPowers();

    var curp = 0;

    for (var role in powers) {
        var power = powers[role];

        if (author.roles.find(r => r.name == role)) {
            if (power > curp) {
                curp = power;
            }
        }
    }

    return curp;
}

function getRolePowerLevel(role) {
    var powers = getPowers();

    for (var _role in settings_.roles) {
        var c = settings_.roles[_role];

        if (role == _role) {
            return powers[c] || 0;
        }
    }
}

util = {
    env: {
        get: global_manager.get,
        set: global_manager.set,
        load: global_manager.load,
        save: global_manager.save,
        log: log,
        onLoad: (data, settings) => {
            data.mutes = data.mutes || {};
            data.bans = data.bans || {};
            data.tickets = data.tickets || {};
            data.session = data.session || {};
            data_ = data;
            settings_ = settings;

            return { data: data, settings: settings };
        },
        parseString: (str) => {
            var prefix = settings_.prefix;
            var args = str.slice(prefix.length).trim().split(/ +/g);
            var command = args.shift().toLowerCase();
            return { command: command, args: args };
        },
        getCmds: () => {
            return cmd.cmds;
        },
        think: think,
        thinkAdd: thinkAdd,
        thinkRemove: thinkRemove
    },
    data: {
        embed: () => {
            var e = new discord.RichEmbed();
            e.setTimestamp();
            e.setFooter(cl.user.username);
            return e;
        },
        embedReply: (message, type, msg) => {
            var e = new discord.RichEmbed();
            var col = 0x42f45f;
            var s = "Command Ran";
            switch (type) {
                case "error":
                    col = 0xf45042;
                    s = "Command Error";
                    break;
                case "warn":
                    s = "Command Fail";
                    col = 0xff821c;
                    break;
                case "info":
                    s = "Command Info";
                    col = 0x671cff;
                    break;
            }

            e.setColor(col);
            e.setTitle(s);
            e.setTimestamp();
            e.setDescription(msg);
            e.setFooter(`${cl.user.username} | Ran by: @${message.author.username}#${message.author.discriminator}`);
            return message.channel.send(e);
        },
        modLog: (msg, embed) => {
            var g = msg.guild;

            var channel = g.channels.find(c => c.name == settings_.mod_log && c.type == "text");

            if (channel) {
                channel.send(embed);
            } else {
                log("error", `Could not find mod-log channel for guild ${g.name}`);
            }
        },
        client: () => {
            cl = new discord.Client();
            return cl;
        },
        on: (w, f) => {
            cl.on(w, f);
        },
        login: (t) => {
            cl.on("ready", () => {
                log("success", `'${cl.user.username}' ready to protect and serve ${cl.guilds.size} guilds.`);
            })
            cl.login(t).catch(err => {
                log("error", `Login failed: ${err} (trace: ${err.stack})`);
            });
        },
        canUserRunCommand: (author, command) => {
            var check = command.role;
            if (check == "user") {
                return true;
            } else if (check == "dev") {
                return author.id == settings_.owner;
            }
            var my = getUserPowerLevel(author);
            var need = getRolePowerLevel(check);

            return my >= need;
        },
        getUserPowerLevel: getUserPowerLevel,
        getRolePowerLevel: getRolePowerLevel,
        isValidTimeAppendage: (char) => {

            switch (char) {
                case "d":
                    return true;
                case "h":
                    return true;
                case "m":
                    return true;
                case "s":
                    return true;
                default:
                    return false;
            }
        },
        getSecondsFromTimeString: (secs, appendage) => {
            var scale = (int) => { return int };

            switch (appendage) {
                case "s":
                    scale = (int) => { return int };
                    break;
                case "m":
                    scale = (int) => { return (int * 60) };
                    break;
                case "h":
                    scale = (int) => { return ((int * 60) * 60) };
                    break;
                case "d":
                    scale = (int) => { return ((int * 60) * 60) * 24 };
            }

            var d = { scale: scale, secs: scale(secs) };

            return d;
        },
        getFormatFromSeconds: angloDuration,
        removeMute: async (who) => {
            var mute = data_.mutes[who];
            var ret = 1;
            if (mute) {
                delete data_.mutes[who];
                ret = 0;
                save("data.json", data_);
            }

            return ret;
        },
        removeBan: async (who) => {
            var ban = data_.bans[who];
            var ret = 1;
            if (ban) {
                delete data_.bans[who];
                ret = 0;
                save("data.json", data_);
            }

            return ret;
        },
        addMute: async (guild, who, time, by, reason) => {
            var mute = data_.mutes[who];

            if (mute) {
                data_.mutes[who].time = time;
                return 1;
            } else {
                data_.mutes[who] = { guild: guild, time: time, by: by, reason: reason };
            }

            save("data.json", data_);

            return 0;
        },
        addBan: async (guild, who, time, by, reason) => {
            var ban = data_.bans[who];

            if (ban) {
                data_.bans[who] = { guild: guild, time: time, by: by, reason: reason };
                return 1;
            } else {
                data_.bans[who] = { guild: guild, time: time, by: by, reason: reason };
            }

            save("data.json", data_);

            return 0;
        }
    },
    run: {
        loadCommands: () => {
            set("commands", cmd.load());
        }
    }
}

module.exports = util;

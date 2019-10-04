const chalk = require("chalk");
const fs = require("fs");
const discord = require("discord.js");
const axios = require("axios")
const cmd = require("./cmd.js");

var cl;
var globals = {};

Array.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

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
    async load(f, def = [], b = false) {
        var e = fs.existsSync(f);
        if (e) {
            var c = fs.readFileSync(f, "utf8");
            var co = "";
            if (b) {
                co = c;
            } else {
                co = JSON.parse(c);
            }
            return co;
        } else {
            var c = "";
            if (b) {
                c = JSON.stringify(def);
            } else {
                c = def;
            }
            fs.writeFileSync(f, c);
            return def;
        }
    },
    async save(f, d, b = false) {
        if (b) {
            return fs.writeFileSync(f, d);
        }
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
            thinkers = cleanArray(thinkers);
        }
    }
    return setTimeout(think, 1000);
}

function thinkAdd(n, f) {
    thinkers[n] = f;
}

function thinkRemove(n, f) {
    delete thinkers[n];
    thinkers = cleanArray(thinkers);
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

var axiosGet = (url, options = {}) => {
    var abort = axios.CancelToken.source();
    var id = setTimeout(abort.cancel, options.TIMEOUT_DELAY || 1500);
    return axios.get(url, { cancelToken: abort.token, ...options }).then(resp => {
        clearTimeout(id);
        return Promise.resolve(resp);
    }).catch(err => {
        clearTimeout(id);
    })
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
            if (str.substring(0, 1) !== prefix) return {};
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
        getServerInfo: async (ip, port) => {
            var d = await axiosGet(`http://${ip}:${port}/info.json`);

            var sdat = {
                cp: 0,
                mp: 0,
                qp: 0,
                stat: true
            }

            if (!d || !d.data) {
                sdat.stat = false;
                return sdat;
            }

            d = d.data;

            var r = await axiosGet(`http://${ip}:${port}/players.json`);

            if (!r || !r.data) {
                sdat.stat = false;
                return sdat;
            }

            r = r.data;

            var i = 0;

            for (var p in r.data) {
                i++;
            }

            sdat.cp = i;
            sdat.mp = d.vars.sv_maxClients || 0;
            sdat.qp = d.vars.sv_queuedPlayers || 0;
            sdat.stat = true;

            return sdat;
        },
        getTicketID: async (dat) => {
            var id = 0;
            for (var user in dat) {
                var ticket = dat[user];

                if (ticket.opened) {
                    id++;
                }
            }

            var str = "";

            if (id >= 1000) {
                str = id;
            } else if (id >= 100) {
                str = "0" + id;
            } else if (id >= 10) {
                str = "00" + id;
            } else if (id >= 1) {
                str = "000" + id;
            } else {
                str = "0001";
            }

            return str;
        },
        embedServerList: async (msg) => {
            var totalPlayers = 0;
            var totalPlayersQueued = 0;
            var sess = msg.session.status;
            if (!sess || !sess.channelID) return;

            var e = embed();
            e.setColor(0x671cff);
            e.setTitle("Server Status");
            var d = Date();
            d = d.replace(" GMT+0000 (Coordinated Universal Time)", "");
            e.setFooter(`Last Update: ${d}`);

            for (var srv in msg.session.servers) {
                var name = msg.session.servers[srv];
                var arg = srv.split(":");
                var dat = await getServerInfo(arg[0], arg[1]);
                var s = dat.stat ? ":white_check_mark:" : ":x:";
                e.addField(`${s} ${name} \`\`${srv}\`\``, `Players: ${dat.cp}/${dat.mp}\nQueue: ${dat.qp}`);
                totalPlayers += dat.cp;
                totalPlayersQueued += dat.cp;
            }

            e.addField("Total Info", `Total Players: ${totalPlayers}\nTotal Players In Queue: ${totalPlayersQueued}`);

            return e;
        },
        fetchMessageDetour: async (chan, msgid, cb) => {
            if (!chan || !msgid) return cb();
            chan.fetchMessage(msgid).then(m => {
                cb(m);
            }).catch(err => {
                cb();
            })
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
            if (!cl) {
                cl = new discord.Client();
            }
            return cl;
        },
        on: (w, f) => {
            cl.on(w, f);
        },
        login: (t) => {
            cl.on("ready", () => {
                log("success", `'${cl.user.username}' ready to protect and serve ${cl.guilds.size} guilds.`);
                for (var g of cl.guilds) {
                    g = g[1];
                    log("info", g.name);
                }
            })
            cl.login(t).catch(err => {
                log("error", `Login failed: ${err}`);
                process.exit(0);
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
        saveData: async () => {
            save("data.json", data_);
        },
        removeMute: async (who) => {
            var mute = data_.mutes[who];
            var ret = 1;
            if (mute) {
                delete data_.mutes[who];
                data_.mutes = cleanArray(data_.mutes);
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
                data_.bans = cleanArray(data_.bans);
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
        },
        doTicketLogger: async (msg) => {
            var isTicket = false;
            var ticketData = {};

            for (var user in msg.session.tickets) {
                var t = msg.session.tickets[user];

                if (t.channel == msg.channel.id) {
                    isTicket = true;
                    ticketData = t;
                    break;
                }
            }

            if (isTicket && ticketData) {
                var c = await load("tickets/" + ticketData.user + ".txt", undefined, true);
                c = c || "";

                c += "\n@" + msg.author.username + "#" + msg.author.discriminator + ": " + msg.content;

                save("tickets/" + ticketData.user + ".txt", c, true);
            }
        },
        setupLog: async (who, ticket) => {
            return save("tickets/" + who.id + ".txt", "--Beginning Of Chat Log For: " + ticket + "--")
        },
        getLog: async (who) => {
            var e = fs.existsSync("tickets/" + who.id + ".txt");
            if (!e) return;
            return "./tickets/" + who.id + ".txt";
        },
        clearLog: async (who) => {
            var e = fs.existsSync("tickets/" + who.id + ".txt");
            if (!e) return;
            return fs.unlinkSync("tickets/" + who.id + ".txt");
        },
        cleanArray: (arr) => {
            var temp = Array.isArray(arr) ? [] : {};

            for (var key in arr) {
                var val = arr[key];

                if (val && val !== NaN && val !== undefined) {
                    if (Array.isArray(temp)) {
                        temp.push(val);
                    } else {
                        temp[key] = val;
                    }
                }
            }

            return temp;
        }
    },
    run: {
        loadCommands: () => {
            set("commands", cmd.load());
        }
    }
}

module.exports = util;

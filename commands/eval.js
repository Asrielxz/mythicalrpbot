var cmd = {}

cmd.name = "eval";
cmd.role = "owner";
cmd.group = "Utility";
cmd.use = "eval [code]";
cmd.desc = "Run code on the bot.";

var clean = async (cl, txt) => {
    if (txt && txt.constructor.name == "Promise")
        txt = await txt;

    if (typeof txt !== "string")
        txt = require("util").inspect(txt, {depth: 1});

    txt = txt
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(cl.settings.token, "<redacted>");

    return txt;
}

cmd.run = async (bot, msg, args, guild) => {
    'use strict'
    var code = args.join(" ");

    var resp = eval(code);

    clean(bot, resp).then(ret => {
        embedReply(msg, "success", ":white_check_mark: Eval success.\n```js\n" + ret + "\n```").then(m=>m.delete(6000));
    }).catch(err => {
        embedReply(msg, "error", ":x: Eval failed.\n```xl\n" + err + "\n```").then(m=>m.delete(6000));
    });

}

module.exports = cmd;


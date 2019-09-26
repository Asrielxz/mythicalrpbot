var fs = require("fs");
require("./util.js");

function stripExt(str) {
    return str.split("/").slice(-1).join().split(".").shift();
}

var cmds = {};

cmd = {
    cmds: cmds,
    load: () => {
        var e = fs.existsSync("commands");
        if (e) {
            var files = fs.readdirSync("commands");
            for (var file in files) {
                file = files[file];
                try {
                    var cmd_ = require(`../commands/${file}`);
                    cmds[cmd_.name] = cmd_;
                    log("success", `Loaded command: ${stripExt(file)}`);
                } catch (err) {
                    log("error", `Loading command failed: ${stripExt(file)} (${err}) (trace: ${err.stack})`)
                }
            }
        }
    }
}

module.exports = cmd;

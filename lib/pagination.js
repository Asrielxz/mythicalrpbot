var discord = require("discord.js");
var firstReaction = "⏮";
var backReaction = "◀";
var stopReaction = "⏹";
var nextReaction = "▶";
var lastReaction = "⏭";

var getFieldsLength = (embed) => {
    var i = 0;

    for (f in embed.fields) {
        i = i + 1;
    }

    return i;
}

var getFieldsSize = (embed) => {
    var i = 0;

    for (f in embed.fields) {
        i = i + embed.fields[f].value.length + embed.fields[f].name.length;
    }

    return i;
}

var loopUntilNone = (embed, store) => {
    store = store || [];

    var len = getFieldsLength(embed);
    var size = getFieldsSize(embed);


}

class Pagination {
    constructor(data) {
        loopUntilNone(data);
    }
}

module.exports = Pagination;
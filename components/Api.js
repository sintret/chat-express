var Chat = require('./../models/Chat.js');
var Api = {};

Api.sent = function (data, from) {
    var to = data.to;
    var message = data.message;
    var arr = [];
    for (i = 0; i < to.length; i++) {
        arr.push({
            message: message,
            from: from,
            to: to[i]
        });
    }

    Chat.bulkCreate(arr).then(function () {

    });
}
module.exports = Api;
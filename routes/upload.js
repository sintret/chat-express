var tRoutes = function (app, isAdmin) {

    app.get('/socket.io-file-client.js', isAdmin, function (req,res,next) {
        return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
    });
}

module.exports = tRoutes;
const express = require("express");
const app = express();
const path = require("path");
const passport = require('passport');
var Strategy = require('passport-local').Strategy;
var expressSession = require('express-session');
const sharp = require('sharp');

const socket = require('socket.io');
const port = 3001;
const io = socket(app.listen(port));
const SocketIOFile = require('socket.io-file');

var Api = require('./components/Api.js');

app.set('trust proxy', 1); // trust first proxy


var session = expressSession({
    secret: 'projectchatok',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 2 * 24 * 60 * 60 * 1000, httpOnly: false}
});


app.use("/static", express.static(path.join(__dirname, "static")));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use(require('body-parser').urlencoded({extended: true}));
app.use(session)
app.use(passport.initialize());
app.use(passport.session());

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function (req, res, next) {
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;

    res.locals.sessionFlashc = req.session.sessionFlashc;

    next();
});

app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.tUserId = req.user.id;
        res.locals.roleId = req.user.roleId;
        req.session.id = req.user.id;
        var t = req.user.id;


        io.engine.generateId = function (req, res) {
            return 'user' + t;
        }

    } else {
        res.locals.tUserId = 0;
        res.locals.roleId = 0;
        req.session.id = null;
    }

    next();
});

var socketArray = [];

var User = require("./models/User.js");
var Hash = require("./components/Hash.js");

passport.use(new Strategy(
    {usernameField: 'username', passwordField: 'password', passReqToCallback: true},
    function (req, username, password, cb) {
        var pass = Hash.encrypt(password);
        User.findOne({
            where: {username: username, status: 1}
        }).then(function (user) {
            console.log(JSON.stringify(user));
            if (!user) {
                req.session.sessionFlashc = 1;
                return cb(null, false);
            }
            if (user.password != pass) {
                req.session.sessionFlashc = 1;
                console.log("user password" + user.password + " pass:" + pass);
                return cb(null, false);
            }

            req.session.user = user;
            req.session.userId = user.id;

            var userid = 'user' + req.session.user.id;

            var a = socketArray.indexOf(userid);
            if (a >= 0) {
                req.session.sessionFlashc = 2;
                return cb(null, false);
            }

            socketArray.push(user.id);
            io.engine.generateId = function (req, res) {
                return userid; // custom id must be unique
            }
            return cb(null, user);
        });
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    if (!user) {
        return cb(err);
    }
    return cb(null, user);
});

app.get("/", loggedIn,

    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {

        User.findAll({
            where: {
                id: {
                    $ne: req.user.id
                }
            }
        }).then(function (users) {
            var Chat = require('./models/Chat.js');
            Chat.findAll({raw: true}, {
                limit: 200,
                order: [
                    ['id', 'desc']
                ]
            }).then(function (chats) {

                res.render('pages/index', {
                    user: req.session.user,
                    users: users,
                    chats: chats
                });
            });
        });

        console.log("JSON IS : " + JSON.stringify(req.session));
    });

app.get("/login", function (req, res) {
    console.log("SESSION" + JSON.stringify(req.session));
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('pages/login', {data: {page_name: "login"}, sessionFlashc: req.session.sessionFlashc});
});

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get("/forgot", function (req, res) {
    console.log("SESSION" + JSON.stringify(req.session));
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('pages/forgot', {data: {page_name: "forgot"}});
});

app.post('/forgot', function (req, res) {
    var email = req.body.email;
    email = email.trim();
    User.findOne({
        where: {
            email: email
        }
    }).then(function (user) {
        if (!user) {
            res.redirect('/forgot?error=true');
        } else {

           /* var nodemailer = require("nodemailer");

            var smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Gmail",
                auth: {
                    user: "superchatawesome@gmail.com",
                    pass: "DonotWorry88"
                }
            });

            smtpTransport.sendMail({
                from: "superchatawesome@gmail.com", // sender address
                to: user.email, // comma separated list of receivers
                subject: "Your Recovery Password", // Subject line
                text: '<b>Hai </b>' + user.fullname + '<p> Your Password is : '+ Hash.decrypt(user.password)+'</p> Thanks' // plaintext body
            }, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Mail sent: " + response.message);
                }
            });*/
            res.redirect('/forgot?success=true');

        }
    });
});

app.get('/logout',
    function (req, res) {
        if (req.isAuthenticated()) {
            var index = socketArray.indexOf(req.session.user.id);
            socketArray.splice(index, 1);
            console.log("socket logout  " + socketArray);

            req.session.user = null;
            req.logout();
        }

        res.redirect('/');
    });

app.get('/test',
    function (req, res) {
        res.render('pages/test');
    });

app.post('/post', loggedIn, function (req, res) {
    var pk = req.body.pk;
    var value = req.body.value;
    value = value.trim();

    if (value.length < 4) {
        var json = {
            status: 'error',
            msg: 'min length is 4 chars!',
            data: null
        }
        res.json(json);
        return;
    }

    var data = [pk, value, req.user.id];

    if (pk == 'password') {
        if (value == 'XXXXXX') {
            data = [pk, req.user.password, req.user.id];
        } else {
            data = [pk, Hash.encrypt(value), req.user.id];
        }
    }

    User.updateSQL(data).then(function (metadata) {
        var json = {
            status: null,
            msg: 'ok!',
            data: null
        }
        res.json(json);
    });
    //console.log(JSON.stringify(req.body));
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

var isAdmin = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        if (req.session.user.roleId == 1) {
            next();
        } else {
            res.redirect('/');
        }
    }
}
app.get('/socket.io-file-client.js', function (req, res, next) {
    return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


io.on('connection', function (socket) {

    var allConnectedClients = Object.keys(io.sockets.connected);
    socketArray = allConnectedClients;

    console.log("socket connected on port " + port);
    console.log("socket id  " + socket.id);
    console.log("socket allConnectedClients  " + JSON.stringify(allConnectedClients));
    console.log("socket socketArray  " + JSON.stringify(socketArray));

    var str = socket.id;
    var socketId = parseInt(str.replace("user", ""));

    io.emit('onlines', {data: socketArray});

    socket.on("sent", function (data) {
        console.log(socketId + " sent : " + JSON.stringify(data));
        data.from = socketId;
        io.emit("receive", data);
        Api.sent(data, socketId);

    });

    socket.on('disconnect', function () {
        console.log("socket left  ");
        var index = socketArray.indexOf(socket.id);
        socketArray.splice(index, 1);
        io.sockets.emit('onlines', {data: socketArray});
    });

    var uploader = new SocketIOFile(socket, {
        uploadDir: 'static/images/',							// simple directory
        accepts: ['audio/mpeg', 'audio/mp3', 'image/x-png', 'image/gif', 'image/jpeg', 'image/png'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
        maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
        chunkSize: 10240,							// default is 10240(1KB)
        transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
        overwrite: true 							// overwrite file if exists, default is true.
    });
    uploader.on('start', function (fileInfo) {
        console.log('Start uploading');
        console.log(fileInfo);
    });
    uploader.on('stream', function (fileInfo) {
        console.log((fileInfo.wrote / fileInfo.size) * 100 + '%');
    });
    uploader.on('complete', function (fileInfo) {
        console.log('Upload Complete.');
        console.log(fileInfo);
        var fileOri = __dirname + '/static/images/' + fileInfo.name;
        var thumbTo = __dirname + '/static/images/thumb/' + fileInfo.name;
        console.log(fileOri);

        sharp(fileOri)
            .resize(100, 100)
            .toFile(thumbTo, function (error5) {
                console.log(error5);
            });


        var where = {id: session.userId}
        var tArray = {photo: fileInfo.name};

        session(socket.handshake, {}, function (err) {
            if (err) {
                /!* handle error *!/
            }
            var tse = socket.handshake.session;
            console.log("socket.handshake.session TO : " + JSON.stringify(tse));

            // do stuff

            User.findOne({where: {id: tse.userId}}).then(function (user) {
                console.log("UPLOAD TO : " + JSON.stringify(user));
                user.updateAttributes({
                    photo: fileInfo.name
                });
                tse.user.photo = fileInfo.name;
                tse.save(function (err) {
                    console.log("error save" + err);
                })

            });
        });


    });
    uploader.on('error', function (err) {
        console.log('Error!', err);

    });
    uploader.on('abort', function (fileInfo) {
        console.log('Aborted: ', fileInfo);

    });

});

require('./routes/user.js')(app, isAdmin);

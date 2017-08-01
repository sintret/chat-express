var express = require("express");
var app = express();
var path = require("path");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session = require('express-session');

var server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket(server);
var port = 3001;
var io = require('socket.io').listen(app.listen(port));


app.use(require('body-parser').urlencoded({extended: true}));
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'projectchatok',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 2 * 24 * 60 * 60 * 1000, httpOnly: false}
}));

app.use("/static", express.static(path.join(__dirname, "static")));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

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
    } else {
        res.locals.tUserId = 0;
        res.locals.roleId = 0;
        req.session.id = null;
    }

    next();
});

var sess;
var socketArray = [];

var User = require("./models/User.js");
var Hash = require("./components/Hash.js");

passport.use(new Strategy(
    {usernameField: 'username',passwordField: 'password', passReqToCallback: true},
    function(req, username, password, cb) {
        // now you can check req.body.foo
        console.log(password);

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

            var a = socketArray.indexOf(user.id);
            if (a >= 0) {
                req.session.sessionFlashc = 2;
                return cb(null, false);
            }

            socketArray.push(user.id);
            io.engine.generateId = function (req, res) {
                return user.id; // custom id must be unique
            }
            return cb(null, user);
        });
    }
));
/*

passport.use(new Strategy(
    function (username, password, cb) {
        console.log(password);

        var pass = Hash.encrypt(password);
        User.findOne({
            where: {username: username, status: 1}
        }).then(function (user) {
            var a = socketArray.indexOf(user.id);
            if (a >= 0) {
                sess.sessionFlash = 2;
                return cb(null, false);
            }

            console.log(JSON.stringify(user));
            if (!user) {
                sess.sessionFlashc = 1;
                return cb(null, false);
            }
            if (user.password != pass) {
                sess.sessionFlashc = 1;
                console.log("user password" + user.password + " pass:" + pass);
                return cb(null, false);
            }
            socketArray.push(user.id);
            io.engine.generateId = function (req, res) {
                return user.id; // custom id must be unique
            }
            return cb(null, user);
        });
    }));
*/

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
            res.render('pages/index', {
                user: req.user,
                users: users
            });
        });

        console.log("JSON IS : " + JSON.stringify(req.session));
    });

app.get("/login", function (req, res) {
    //sess = req.session;

    console.log("SESSION"+JSON.stringify(req.session));
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('pages/login', {data: {page_name: "login"}, sessionFlashc:req.session.sessionFlashc});
});

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        /*var username = req.body.username;

         console.log(username);

         User.findOne({
         where: {username: username, status: 1}
         }).then( function (user) {
         if(!user){
         res.redirect('/login?error=1');
         } else {
         var a = socketArray.indexOf(user.id);
         if (a >= 0) {
         var index = socketArray.indexOf(req.user.id);
         socketArray.splice(index, 1);
         console.log("socket logout  " + socketArray);

         req.logout();

         res.redirect('/login?error=2');
         }
         }
         });
         */
        res.redirect('/');
    });

app.get('/logout',
    function (req, res) {
        if (req.isAuthenticated()) {
            var index = socketArray.indexOf(req.user.id);
            socketArray.splice(index, 1);
            console.log("socket logout  " + socketArray);

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

    var data = [pk, value, req.user.id];

    User.updateSQL(data).then(function (metadata) {
        var json = {
            error: null,
            data: value
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
    if (req.user.roleId == 1) {
        next();
    } else {
        res.redirect('/');
    }
}

require('./routes/user.js')(app, isAdmin);

io.on('connection', function (socket) {
    console.log("socket connected on port " + port);
    console.log("socket id  " + socket.id);
    console.log("socket array  " + JSON.stringify(socketArray));

    io.sockets.emit('onlines', {data: socketArray});

    socket.on('disconnect', function () {
        console.log("socket left  ");
        var index = socketArray.indexOf(socket.id);
        socketArray.splice(index, 1);
        io.sockets.emit('onlines', {data: socketArray});
    });
});
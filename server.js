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
    next();
});

var sess;
var socketArray = [];

var User = require("./models/User.js");
var Hash = require("./components/Hash.js");

passport.use(new Strategy(
    function (username, password, cb) {
        console.log(password);

        var pass = Hash.encrypt(password);
        User.findOne({
            where: {username: username, status: 1}
        }).then(function (user) {
            var a = socketArray.indexOf(user.id);
            if (a >= 0) {
                return cb(null, false);
            }


            console.log(JSON.stringify(user));
            if (!user) {
                return cb(null, false);
            }
            if (user.password != pass) {
                console.log("user password" + user.password + " pass:" + pass);
                return cb(null, false);
            }
            socketArray.push(user.id);
            io.engine.generateId = function (req, res) {
                return user.id; // custom id must be unique
            }
            // sess.isLogin = true;
            //sess.user = user;
            return cb(null, user);
        });
    }));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    User.findById(id).then(function (user) {
        if (!user) {
            return cb(err);
        }
        cb(null, user);
    });
});

app.get("/", loggedIn,
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        //sess = req.session;
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
    });

app.get("/login", function (req, res) {

   // var e = req.params.error;
   // console.log("error " + e);
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('pages/login', {data: {page_name: "login"}});
});

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login?error=true'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/logout',
    function (req, res) {
        var index = socketArray.indexOf(req.user.id);
        socketArray.splice(index, 1);
        console.log("socket logut  " + socketArray);

        req.logout();
        res.redirect('/');
    });

app.get('/test',
    function (req, res) {
        res.render('pages/test');
    });

app.post('/post', function (req, res) {
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

require('./routes/user.js')(app);

io.on('connection', function (socket) {
    var sessionId = socket.id;
    console.log("socket connected on port " + port);
    console.log("socket id  " + socket.id);
    console.log("socket aray  " + socketArray);

});

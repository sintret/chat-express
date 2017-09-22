var tRoutes = {}

tRoutes.isAdmin = function (req, res, next) {
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

tRoutes.loggedIn = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

module.exports = tRoutes;
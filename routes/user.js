var tRoutes = function (app) {
    const datatable = require('sequelize-datatables');
    const model = require('./../models/User.js');

    app.get("/users", function (req, res) {
        datatable(model, req.query, {}).then(function (result) {
            res.render('pages/users', {
                user: req.user,
                datas: result
            });
        });

    });
}

module.exports = tRoutes;
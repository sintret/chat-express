var tRoutes = function (app) {
    const datatable = require('sequelize-datatables');
    const model = require('./../models/User.js');

    app.get("/users", function (req, res) {
        var limit = 50;
        var offset = 0;
        model.findAndCountAll()
            .then(function (data) {
                var page = req.query.page || 1;
                var pages = Math.ceil(data.count / limit);
                offset = limit * (page - 1);
                model.findAll({
                        //attributes: ['id', 'first_name', 'last_name', 'date_of_birth'],
                        limit: limit,
                        offset: offset,
                        $sort: {id: 1}
                    })
                    .then(function (datas) {
                        res.render('user/index', {
                            user: req.user,
                            results: datas,
                            count: pages,
                            currentPage: page
                        });
                    });
            })
            .catch(function (error) {
                res.status(500).send(error.toString());
            });

    });

    app.get('/user/create', function (req, res) {
        res.render('user/create', {
            user: req.user,
            data: model.attributeData
        });
    });

    app.post('/user/create', function (req, res) {

    });
    
    var a = function (req,res,next) {
        
    }

    app.get('/user/edit/:id', a);
    app.post('/user/edit/:id', a);
    app.delete('/user/delete/:id', a);

    app.get("/userList", function (req, res) {
        datatable(model, req.query, {}).then(function (result) {
            res.json(result);
        });
    });
}

module.exports = tRoutes;
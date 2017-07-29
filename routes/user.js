var tRoutes = function (app) {
    const datatable = require('sequelize-datatables');
    const model = require('./../models/User.js');
    const fileUpload = require('express-fileupload');
    const hash = require('./../components/Hash.js');
    const sharp = require('sharp');
    var fs = require('fs');
    app.use(fileUpload());

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
        var today = new Date();
        var milliseconds = today.getMilliseconds();
        var photo = 'user.jpg';

        if (!req.files) {
            return res.status(400).send('No files were uploaded.');

        } else {
            var sampleFile = req.files.photo;
            var imageName = milliseconds + sampleFile.name;
            photo = imageName;

            var imageTo = __dirname + './../static/images/' + imageName;
            var thumbTo = __dirname + './../static/images/thumb/' + imageName;
            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(imageTo, function (err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    sharp(imageTo)
                        .resize(200, 200)
                        .toFile(thumbTo, function(err) {
                            // output.jpg is a 200 pixels wide and 200 pixels high image
                            // containing a scaled and cropped version of input.jpg
                        });
                    var data = {
                        username: req.body.username,
                        fullname: req.body.fullname,
                        photo: photo,
                        roleId: req.body.roleId,
                        email: req.body.email,
                        password: hash.encrypt(req.body.password)
                    }

                    model.create(data).then(function (p) {
                        console.log(p);
                        res.redirect('/users');
                    });
                }
            });
        }

    });

    var a = function (req, res, next) {

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
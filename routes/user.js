var tRoutes = function (app, isAdmin) {
    const datatable = require('sequelize-datatables');
    const model = require('./../models/User.js');
    const fileUpload = require('express-fileupload');
    const hash = require('./../components/Hash.js');
    const sharp = require('sharp');
    var fs = require('fs');
    app.use(fileUpload());

    app.get("/users",isAdmin, function (req, res) {
        console.log(JSON.stringify(req.user));
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

    app.get('/user/create',isAdmin, function (req, res) {
        req.session.tForm = 'create';

        res.render('user/create', {
            user: req.user,
            data: model.attributeData
        });
    });

    var userCheck = function (req, res, next) {
        username = req.body.username;
        email = req.body.email;

        model.count({
            where: {
                $or: [{username: username}, {email: email}]
            }
        }).then(function (count) {
            if (count) {
                req.session.sessionFlash = {
                    type: 'warning',
                    title: 'Create User Form',
                    message: 'username or email has already taken!'
                }
                res.redirect('/user/' + req.session.tForm)
            } else {
                next();
            }
        });
    }

    app.post('/user/create', userCheck, isAdmin,function (req, res) {
        var today = new Date();
        var milliseconds = today.getMilliseconds();
        var photo = 'user.png';
        req.session.tForm = 'create';

        if (req.files.hasOwnProperty('photo')) {

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
                        .resize(100, 100)
                        .toFile(thumbTo, function (err) {
                            // output.jpg is a 200 pixels wide and 200 pixels high image
                            // containing a scaled and cropped version of input.jpg
                        });
                    var data = {
                        username: req.body.username,
                        fullname: req.body.fullname,
                        photo: photo,
                        roleId: req.body.roleId,
                        email: req.body.email,
                        password: hash.encrypt(req.body.password),
                        status: req.body.status == 'on' ? 1 : 0
                    }

                    model.create(data).then(function (p) {
                        console.log(p);
                        res.redirect('/users');
                    });
                }
            });
        } else {
            var data = {
                username: req.body.username,
                fullname: req.body.fullname,
                photo: photo,
                roleId: req.body.roleId,
                email: req.body.email,
                password: hash.encrypt(req.body.password),
                status: req.body.status == 'on' ? 1 : 0
            }

            model.create(data).then(function (p) {
                console.log(p);
                res.redirect('/users');
            });

        }

    })

    app.get('/user/update/:id', userCheck,isAdmin, function (req, res) {
        req.session.tForm = 'update';

        var id = req.params.id;

        model.findById(id).then(function (m) {
            res.render('user/update', {
                user: req.user,
                data: m
            });
        });

    });

    app.post('/user/update/:id',isAdmin, function (req, res) {
        req.session.tForm = 'update';
        var id = req.params.id;

        console.log("status is : " + req.body.status);

        var today = new Date();
        var milliseconds = today.getMilliseconds();
        var photo = 'user.png';

        console.log("files" + req.files);
        if (req.files.hasOwnProperty('photo')) {
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
                        .resize(100, 100)
                        .toFile(thumbTo, function (err) {
                            // output.jpg is a 200 pixels wide and 200 pixels high image
                            // containing a scaled and cropped version of input.jpg
                        });


                    model.findById(id).then(function (user) {

                        var data = {
                            username: req.body.username,
                            fullname: req.body.fullname,
                            photo: photo,
                            roleId: req.body.roleId,
                            email: req.body.email,
                            password: req.body.password == user.password ? req.body.password : hash.encrypt(req.body.password),
                            status: req.body.status == 'on' ? 1 : 0
                        }

                        model.update(data, {where: {id: id}}).then(function (m) {
                            console.log(m);
                            res.redirect('/users');
                        });
                    });

                }
            });

        } else {

            model.findById(id).then(function (user) {

                var data = {
                    username: req.body.username,
                    fullname: req.body.fullname,
                    roleId: req.body.roleId,
                    email: req.body.email,
                    password: req.body.password == user.password ? req.body.password : hash.encrypt(req.body.password),
                    status: req.body.status == 'on' ? 1 : 0
                }

                model.update(data, {where: {id: id}}).then(function (m) {
                    console.log(m);
                    res.redirect('/users');
                });
            });
        }

    });

    app.delete('/user/:id',isAdmin, function (req, res) {
        var id = req.params.id;
        model.findById(id).then(function (user) {
          if(user){
              var json = {
                  error: "",
                  title: "Success to Delete User",
                  message: "Success!"
              };
              user.destroy();
              res.json(json);
          }  else {
              var json = {
                  error: "User not known",
                  title: "Failed to Delete User",
                  message: "Please check your request again!"
              };
              res.json(json);
          }
        })

    });

    app.get('/user/view/:id',isAdmin, function (req, res) {
        var id = req.params.id;
        model.findById(id).then(function (user) {
            res.render('user/view', {
                user: req.user,
                data: user
            });
        })
    })

    app.get("/userList",isAdmin, function (req, res) {
        datatable(model, req.query, {}).then(function (result) {
            res.json(result);
        });
    });
}

module.exports = tRoutes;
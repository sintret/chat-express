const Sequelize = require('sequelize');
var sequelize = require('./config.js');

var attributeData = {
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING
    },
    fullname: {
        type: Sequelize.STRING
    },
    photo: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    roleId: {
        type: Sequelize.INTEGER
    },
    status: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE
    },
    updatedAt: {
        type: Sequelize.DATE
    }
}

//User singleton
var User = sequelize.define('user', attributeData);

var obj = {};
for (var property in attributeData) {
    if (attributeData.hasOwnProperty(property)) {
        // do stuff
        obj.proprtyy = null;
    }
}

//get attribute data
User.attributeData = obj;


module.exports = User;
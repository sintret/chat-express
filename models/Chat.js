const Sequelize = require('sequelize');
var sequelize = require('./config.js');

var attributeData = {
    message: {
        type: Sequelize.TEXT
    },
    from: {
        type: Sequelize.STRING
    },
    to: {
        type: Sequelize.STRING
    },
    updatedAt: {
        type: Sequelize.DATE
    }
}

//Model singleton
var model = sequelize.define('chat', attributeData,{
    timestamps: false
});

var obj = {};
for (var property in attributeData) {
    if (attributeData.hasOwnProperty(property)) {
        // do stuff
        obj.property = null;
    }
}

//get attribute data
model.attributeData = obj;
module.exports = model;
"use strict";

module.exports = function(sequelize, DataTypes) {
    var message = sequelize.define('messages', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        googleappid: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        action: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
    }, {
        tableName: 'messages'

    });
    return message;
};

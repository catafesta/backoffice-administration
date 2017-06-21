"use strict";

module.exports = function(sequelize, DataTypes) {
    var user_message = sequelize.define('user_messages', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        login_data_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'user_message'
        },
        message_id: {
            type: DataTypes.INTEGER(128),
            allowNull: false,
            unique: 'user_message'
        }
    }, {
        tableName: 'messages',
        associate: function(models) {
            user_message.belongsTo(models.messages, {foreignKey: 'message_id'});
            user_message.belongsTo(models.login_data, {foreignKey: 'login_data_id'});
        }

    });
    return user_message;
};

"use strict";

module.exports = function(sequelize, DataTypes) {
    var favorite_channels = sequelize.define('favorite_channels', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false, 
			primaryKey: true,
            autoIncrement: true
        },
        channel_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    }, {
        tableName: 'favorite_channels',
        associate: function(models) {
            favorite_channels.belongsTo(models.channels, {foreignKey: 'channel_id'});
            favorite_channels.belongsTo(models.login_data, {foreignKey: 'user_id'});
        }
    });
    return favorite_channels;
};

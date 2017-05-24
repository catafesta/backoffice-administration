"use strict";

module.exports = function(sequelize, DataTypes) {
    var channelStream = sequelize.define('channel_stream', {
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
        channel_number: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        stream_source_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        stream_url: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        stream_format: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        token: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        token_url: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        encryption: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        encryption_url: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        is_octoshape: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    }, {
        tableName: 'channel_stream',
        associate: function(models) {
            channelStream.belongsTo(models.channel_stream_source, {foreignKey: 'stream_source_id'});
            channelStream.belongsTo(models.channels, {foreignKey: 'channel_id'})
        }
    });
    return channelStream;
};

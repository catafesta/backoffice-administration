"use strict";

module.exports = function(sequelize, DataTypes) {
    var Settings = sequelize.define('settings', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        locale: {
            type: DataTypes.STRING,
            defaultValue: 'en',
        },
        log_event_interval: {
            type: DataTypes.INTEGER(11),
            defaultValue: 300,
            allowNull: false,
        },
        mobile_background_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'mobile_background_url'
        },
        mobile_logo_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'mobile_logo_url'
        },
        box_logo_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'box_logo_url'
        },
        box_background_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'box_background_url'
        },
        vod_background_url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'vod_background_url'
        },
        assets_url: {
            type: DataTypes.STRING,
        },
        ip_service_url: {
            type: DataTypes.STRING,
        },
        ip_service_key: {
            type: DataTypes.STRING
        },
        activity_timeout:{
            type: DataTypes.INTEGER(11),
            defaultValue: 10801,
            allowNull: false
        },
        channel_log_time: {
            type: DataTypes.INTEGER(11),
            defaultValue: 6,
            allowNull: false
        },
        email_address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        analytics_id: {
            type: DataTypes.STRING
        },
        old_encryption_key: {
            type: DataTypes.STRING
        },
        new_encryption_key: {
            type: DataTypes.STRING
        },
        key_transition: {
            type: DataTypes.BOOLEAN
        },
        company_url: {
            type: DataTypes.STRING,
            defaultValue: 'magoware.tv'
        },
        vodlastchange :{
            type: DataTypes.BIGINT(13),
            defaultValue: 0,
            allowNull: false
        },
        livetvlastchange :{
            type: DataTypes.BIGINT(13),
            defaultValue: 0,
            allowNull: false
        },
        menulastchange :{
            type: DataTypes.BIGINT(13),
            defaultValue: 0,
            allowNull: false
        },
        googlegcmapi: {
            type: DataTypes.STRING,
        },
        applekeyid: {
            type: DataTypes.STRING,
        },
        appleteamid: {
            type: DataTypes.STRING,
        },
        applecertificate:{
            type: DataTypes.STRING,
        }
    }, {
        tableName: 'settings',
        associate: function(models) {
        }
    });

    Settings.beforeUpdate(function(settings, options) {
        if (settings.changed('new_encryption_key')) {
            settings.set('old_encryption_key', settings['_previousDataValues'].new_encryption_key); //save previous key to to old key, before the value is lost
            settings.set('key_transition', true); //since keys were exchanged, set key transition to true regardless of user input
        }
    })

    return Settings;
};

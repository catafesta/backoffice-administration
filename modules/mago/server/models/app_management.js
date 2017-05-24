"use strict";

module.exports = function(sequelize, DataTypes) {
    var appManagement = sequelize.define('app_management', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        appid: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },

        app_version: {
            type: DataTypes.STRING(16),
            allowNull: false
        },

        title: {
            type: DataTypes.STRING(10),
            allowNull: false
        },

        description: {
            type: DataTypes.STRING(128),
                allowNull: false
        },

        url: {
            type: DataTypes.STRING(128),
            allowNull: false
        },

        upgrade_min_api: {
            type: DataTypes.STRING(16),
                allowNull: false
        },

        upgrade_min_app_version: {
            type: DataTypes.STRING(16),
                allowNull: false
        },
        beta_version: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'app_management'
    });
    return appManagement;
};

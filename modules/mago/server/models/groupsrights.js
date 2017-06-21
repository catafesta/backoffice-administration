"use strict";

module.exports = function(sequelize, DataTypes) {
    var Grouprights = sequelize.define('grouprights', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'compositeIndex'
        },
        api_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'compositeIndex'
        },
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        edit: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        create: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
    }, {
        tableName: 'grouprights',
        associate: function(models) {
            Grouprights.belongsTo(models.apiurl, {foreignKey: 'api_id'});
            Grouprights.belongsTo(models.groups, {foreignKey: 'group_id'});
        }
    });
    return Grouprights;
};

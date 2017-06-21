"use strict";

module.exports = function(sequelize, DataTypes) {
    var Apiurl = sequelize.define('apiurl', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        api_url: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'api_url',
        //associate: function(models) {
        //    Grouprights.belongsTo(models.groups, {foreignKey: 'group_id'});
        //}
        associate: function(models) {
            if (models.grouprights){
                Apiurl.hasMany(models.grouprights, {foreignKey: 'api_id'});
            }
        }
    });
    return Apiurl;
};

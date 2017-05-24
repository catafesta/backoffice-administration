"use strict";

module.exports = function(sequelize, DataTypes) {
    var customerData = sequelize.define('customer_data', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        firstname: {
            type: DataTypes.STRING(64),
            allowNull: false,
            default: 'firstname'
        },
        lastname: {
            type: DataTypes.STRING(64),
            allowNull: false,
            default: 'lastname'
        },
        email: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },
        address: {
            type: DataTypes.STRING(128),
            allowNull: true,
            default: 'address'
        },
        city: {
            type: DataTypes.STRING(64),
            allowNull: true,
            default: 'city'
        },
        country: {
            type: DataTypes.STRING(64),
            allowNull: true,
            default: 'country'
        },
        telephone: {
            type: DataTypes.STRING(64),
            allowNull: true,
            default: '0'
        }
    }, {
        tableName: 'customer_data',
        associate: function(models) {
            if (models.login_data){
                customerData.hasMany(models.login_data, {foreignKey: 'customer_id'});
            }
        }
    });
    return customerData;
};

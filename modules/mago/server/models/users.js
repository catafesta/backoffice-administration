"use strict";

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var Users = sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        username: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true,
            validate: {
                isUnique: function(value, next) {
                    var self = this;
                    Users.find({
                            where: {
                                username: value
                            }
                        })
                        .then(function(user) {
                            // reject if a different user wants to use the same email
                            if (user && self.id !== user.id) {
                                return next('Username already exists, please choose another');
                            }
                            return next();
                        })
                        .catch(function(err) {
                            return next(err);
                        });
                }
            }
        },
        password: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        hashedpassword: {
            type: DataTypes.STRING,
            defaultValue: '',
            validate: {
                //isValid: validateLocalStrategyPassword
            }
        },
        salt: DataTypes.STRING,
        email: {
            type: DataTypes.STRING(45),
            unique: true,
            validate: {
                //isValid: validateLocalStrategyProperty,
                isEmail: {
                    msg: 'Please fill a valid email address'
                },
                isUnique: function(value, next) {
                    var self = this;
                    Users.find({
                            where: {
                                email: value
                            }
                        })
                        .then(function(user) {
                            // reject if a different user wants to use the same email
                            if (user && self.id !== user.id) {
                                return next('Email already exists, please choose another');
                            }
                            return next();
                        })
                        .catch(function(err) {
                            return next(err);
                        });
                }
            }
        },
        telephone: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        resetpasswordtoken: DataTypes.STRING,
        resetpasswordexpires: DataTypes.BIGINT
    },
    {
        instanceMethods: {
            makeSalt: function() {
                return crypto.randomBytes(16).toString('base64');
            },
            authenticate: function(plainText) {
                return this.encryptPassword(plainText, this.salt) === this.hashedpassword;
            },
            encryptPassword: function(password, salt) {
                if (!password || !salt)
                    return '';
                salt = new Buffer(salt, 'base64');
                return crypto.pbkdf2Sync(password, salt, 10000, 64,'sha1').toString('base64');
            }
        },
        tableName: 'users',
        associate: function(models) {
            if(models.salesreport){
                Users.hasMany(models.salesreport, {foreignKey: 'user_id'})
            }
            Users.belongsTo(models.groups, {foreignKey: 'group_id'});
            Users.hasMany(models.logs, {foreignKey: 'user_id'});
        }
    });
    return Users;
};

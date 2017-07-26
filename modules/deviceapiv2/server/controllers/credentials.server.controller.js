'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    password_encryption = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
    models = db.models;

/**
 * @api {post} /apiv2/credentials/login /apiv2/credentials/login
 * @apiVersion 0.2.0
 * @apiName DeviceCheckLogin
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription If token is present, it is used to check login
 */

/**
 * @api {post} /apiv2/credentials/login /apiv2/credentials/login
 * @apiVersion 0.2.0
 * @apiName DeviceLogin
 * @apiGroup DeviceAPI
 *
 * @apiParam {String} username Customers login username.
 * @apiParam {String} password Customers login password.
 * @apiParam {String} boxid Unique device ID.
 *
 * @apiDescription If token is not present, plain text values are used to login
 */
exports.login = function(req, res) {
    var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
    var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
    var appids = [];

    models.app_group.findOne({
        attributes: ['app_group_id'],
        where: {app_id: req.auth_obj.appid}
    }).then(function (result) {
        models.app_group.findAll({
            attributes: ['app_id'],
            where: {app_group_id: result.app_group_id}
        }).then(function (result) {
            for(var i = 0; i<result.length; i++){
                appids.push(result[i].app_id);
            }
            //login start
            models.login_data.findOne({
                where: {username: req.auth_obj.username},
                attributes: [ 'id','username', 'password', 'account_lock', 'salt']
            }).then(function(users) {
                if (!users) {
                    //todo: this should be handled @token validation. for now it generates an empty response
                    var user_not_found = new response.APPLICATION_RESPONSE(req.body.language, 702, -1, 'USER_NOT_FOUND_DESCRIPTION', 'USER_NOT_FOUND_DATA');
                    res.send(user_not_found);
                }
                else if (users.account_lock) {
                    //todo: this should be handled @token validation, though it does return a response
                    var account_locked = new response.APPLICATION_RESPONSE(req.body.language, 703, -1, 'ACCOUNT_LOCK_DESCRIPTION', 'ACCOUNT_LOCK_DATA');
                    res.send(account_locked);
                }
                else if(password_encryption.authenticate(req.auth_obj.password, req.thisuser.salt, req.thisuser.password) === false) {
                    var wrong_pass = new response.APPLICATION_RESPONSE(req.body.language, 704, -1, 'WRONG_PASSWORD_DESCRIPTION', 'WRONG_PASSWORD_DATA');
                    res.send(wrong_pass);
                }
                else  {
                    models.devices.findOne({
                        where: {username: req.auth_obj.username, device_active:true, appid:{in: appids}}
                    }).then(function(device){
                        //if record is found then device is found
                        if(device) {
                            if(req.auth_obj.boxid == device.device_id ) {
                                //same user login on same device
                                //update value of device_active, since a user is loging into this device
                                device.updateAttributes({
                                    login_data_id:		users.id,
                                    username:           req.auth_obj.username,
                                    device_mac_address: decodeURIComponent(req.body.macaddress),
                                    appid:              req.auth_obj.appid,
                                    app_name:           (req.body.app_name) ? req.body.app_name : '',
                                    app_version:        req.body.appversion,
                                    ntype:              req.body.ntype,
                                    device_id:          req.auth_obj.boxid,
                                    hdmi:               (req.body.hdmi=='true') ? 1 : 0,
                                    firmware:           decodeURIComponent(req.body.firmwareversion),
                                    device_brand:       decodeURIComponent(req.body.devicebrand),
                                    screen_resolution:  decodeURIComponent(req.body.screensize),
                                    api_version:        decodeURIComponent(req.body.api_version),
                                    device_ip:          req.ip.replace('::ffff:', ''),
                                    os:                 decodeURIComponent(req.body.os)
                                }).then(function(result){
                                    clear_response.response_object = [{
                                        "encryption_key": req.app.locals.settings.new_encryption_key
                                    }];
                                    res.send(clear_response);
                                    return null;
                                }).catch(function(error) {
                                    res.send(database_error);
                                });
                            }
                            else {
                                //same user try to login on another device
                                var dual_login_attempt = new response.APPLICATION_RESPONSE(req.body.language, 705, -1, 'DUAL_LOGIN_ATTEMPT_DESCRIPTION', 'DUAL_LOGIN_ATTEMPT_DATA');
                                res.send(dual_login_attempt);
                                return null;
                            }
                        }
                        else {
                            //fist time login, register on the database
                            models.devices.upsert({
                                device_active:      true,
                                login_data_id:		users.id,
                                username:           req.auth_obj.username,
                                device_mac_address: decodeURIComponent(req.body.macaddress),
                                appid:              req.auth_obj.appid,
                                app_name:           (req.body.app_name) ? req.body.app_name : '',
                                app_version:        req.body.appversion,
                                ntype:              req.body.ntype,
                                device_id:          req.auth_obj.boxid,
                                hdmi:               (req.body.hdmi=='true') ? 1 : 0,
                                firmware:           decodeURIComponent(req.body.firmwareversion),
                                device_brand:       decodeURIComponent(req.body.devicebrand),
                                screen_resolution:  decodeURIComponent(req.body.screensize),
                                api_version:        decodeURIComponent(req.body.api_version),
                                device_ip:          req.ip.replace('::ffff:', ''),
                                os:                 decodeURIComponent(req.body.os)
                            }).then(function(result){
                                clear_response.response_object = [{
                                    "encryption_key": req.app.locals.settings.new_encryption_key
                                }];
                                res.send(clear_response);
                                return null;
                            }).catch(function(error) {
                                res.send(database_error);
                            });

                        }
                        return null;
                    }).catch(function(error) {
                        res.send(database_error);
                    });
                }
                return null;
            }).catch(function(error) {
                res.send(database_error);
            });
            //login end
            return null;
        }).catch(function(error) {
            res.send(database_error);
        });
        return null;
    }).catch(function(error) {
        res.send(database_error);
    });


};


/**
 * @api {post} /apiv2/credentials/logout /apiv2/credentials/logout
 * @apiVersion 0.2.0
 * @apiName DeviceLogout
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Removes check box from device so user can login on another device
 */
exports.logout = function(req, res) {
    models.devices.update(
        {
            device_active: false
        },
        {
            where: { username : req.auth_obj.username, appid : req.auth_obj.appid}
        }).then(function (result) {
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });
};

exports.logout_user = function(req, res) {
    var appids = []; //will store appids of devices of the same type

    //find type of device
    models.app_group.findOne({
        attributes: ['app_group_id'],
        where: {app_id: req.auth_obj.appid}
    }).then(function (result) {
        //find appids of the same group as this one
        models.app_group.findAll({
            attributes: ['app_id'],
            where: {app_group_id: result.app_group_id}
        }).then(function (result) {
            for(var i = 0; i<result.length; i++){
                appids.push(result[i].app_id);
            }
            //log this user out of devices of this type
            models.devices.update(
                {
                    device_active: false
                },
                {
                    where: { username : req.auth_obj.username, appid : {in: appids}}
                }).then(function (result) {
                var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'LOGOUT_OTHER_DEVICES');
                res.send(clear_response);
            }).catch(function(error) {
                var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
                res.send(database_error);
            });
            return null;
        }).catch(function(error) {
            var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
            res.send(database_error);
        });
        return null;
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

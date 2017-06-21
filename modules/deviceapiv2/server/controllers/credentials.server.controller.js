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
    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
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
                    res.send(response.USER_NOT_FOUND);
                }
                else if (users.account_lock) {
                    res.send(response.ACCOUNT_LOCK);
                }
                else if(password_encryption.authenticate(req.auth_obj.password, req.thisuser.salt, req.thisuser.password) === false) {
                    res.send(response.WRONG_PASSWORD);
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
                                res.send(response.DUAL_LOGIN_ATTEMPT);
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
    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    models.devices.update(
        {
            device_active: false
        },
        {
            where: { username : req.auth_obj.username, appid : req.auth_obj.appid}
        }).then(function (result) {
        res.send(clear_response);
    }).catch(function(error) {
        res.send(database_error);
    });
};

exports.logout_user = function(req, res) {
    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
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
                clear_response.extra_data = "You have been logged out of other devices";
                res.send(clear_response);
            }).catch(function(error) {
                res.send(database_error);
            });
            return null;
        }).catch(function(error) {
            res.send(database_error);
        });
        return null;
    }).catch(function(error) {
        res.send(database_error);
    });

};

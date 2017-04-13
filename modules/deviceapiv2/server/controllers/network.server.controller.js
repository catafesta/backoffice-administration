/**
 * Author:    G. Lalaj
 * Created:   21-07.2016
 *
 * (c) Copyright by MAGOWARE
 **/

'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
	winston = require(path.resolve('./config/lib/winston')),
    response = require(path.resolve("./config/responses.js")),
    querystring = require("querystring"),
	//objectlength = require(path.resolve("./modules/core/server/controllers/functions.server.controller.js")),
    models = db.models;

//makes a database call. returns database_error if connection failed, one genre_id otherwise

exports.dbtest = function(req, res) {
    var clear_response = new response.OK();
    models.genre.findAll({
        attributes: ['id'],
        limit: 1
    }).then(function (result) {
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        console.log(error);
        res.send(response.DATABASE_ERROR);
    });
};


//REGISTERS GOOGLE APP ID FOR NEW DEVICES OR UPDATES IT FOR DEVICES THAT HAVE BEEN REGISTRED ALREADY. CALLED BEFORE AND AFTER LOGIN
/**
 * @api {POST} /apiv2/network/gcm Device Register
 * @apiName GCM
 * @apiGroup APIV2
 *
 * @apiParam {Number} googleappid Users unique ID.
 * @apiParam {Number} boxid Users unique ID.
 * @apiParam {Number} macaddress Users unique ID.
 * @apiParam {Number} ntype Users unique ID.
 * @apiParam {Number} appid Users unique ID.
 * @apiParam {Number} appversion Users unique ID.
 * @apiParam {Number} devicebrand Users unique ID.
 * @apiParam {Number} os Users unique ID.
 * @apiParam {Number} screensize Users unique ID.
 * @apiParam {Number} devicebrand Users unique ID.
 * @apiParam {Number} hdmi Users unique ID.
 * @apiParam {Number} firmwareversion Users unique ID.
 * @apiParam {Number} api_version Users unique ID.
 * @apiParam {Number} language Users unique ID.
 *
 * @apiSuccess {Object} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status_code": 200,
 *       "error_code": -1,
 *       "timestamp": Date.now(),
 *       "error_description": 'OK',
 *       "extra_data": '',
 *       "response_object": [{}]
 *   }
 *
 */
 
 //API saves the device record before login, performing an insert in the first activisation and update afterwards
exports.gcm = function(req, res) {

	if(req.auth_obj.boxid == undefined){
		var clear_response = new response.OK();

		var auth_obj = querystring.parse(req.body.auth,";","=");
		models.devices.upsert({
			googleappid           : decodeURIComponent(req.body.google_app_id),
			device_id             : auth_obj.boxid,
			device_ip             : req.ip.replace('::ffff:', ''),
			device_mac_address    : (req.body.ntype == '2') ? decodeURIComponent(req.body.macaddress) : '',
			device_wifimac_address: (req.body.ntype == '1') ? decodeURIComponent(req.body.macaddress) : '',
			ntype                 : req.body.ntype,
			appid                 : req.body.appid,
			app_name              : (req.body.app_name) ? req.body.app_name : '',
			app_version           : req.body.appversion,
			device_brand          : decodeURIComponent(req.body.devicebrand),
			os                    : decodeURIComponent(req.body.os),
			screen_resolution     : req.body.screensize,
			hdmi				  : (req.body.hdmi=='true') ? 1 : 0,
			api_version           : req.body.api_version,
			firmware              : decodeURIComponent(req.body.firmwareversion),
			language              : req.body.language
		}).then(function(result){
			res.send(clear_response);
			return null;
		}).catch(function(error) {
			console.log(error);
			res.send(response.DATABASE_ERROR);
		});

	}
	else {
		var clear_response = new response.OK();
		models.devices.upsert({
			googleappid           : decodeURIComponent(req.body.google_app_id),
			device_id             : req.auth_obj.boxid,
			device_ip             : req.ip.replace('::ffff:', ''),
			device_mac_address    : (req.body.ntype == '2') ? decodeURIComponent(req.body.macaddress) : '',
			device_wifimac_address: (req.body.ntype == '1') ? decodeURIComponent(req.body.macaddress) : '',
			ntype                 : req.body.ntype,
			appid                 : req.body.appid,
			app_name              : (req.body.app_name) ? req.body.app_name : '',
			app_version           : req.body.appversion,
			device_brand          : decodeURIComponent(req.body.devicebrand),
			os                    : decodeURIComponent(req.body.os),
			screen_resolution     : req.body.screensize,
			hdmi				  : (req.body.hdmi=='true') ? 1 : 0,
			api_version           : req.body.api_version,
			firmware              : decodeURIComponent(req.body.firmwareversion),
			language              : req.body.language
		}).then(function(result){
			res.send(clear_response);
			return null;
		}).catch(function(error) {
			console.log(error);
			res.send(response.DATABASE_ERROR);
		});
	}
};
'use strict'
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    models = db.models;

/**
 * @api {post} /apiv2/main/device_menu /apiv2/main/device_menu
 * @apiVersion 0.2.0
 * @apiName DeviceMenu
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Removes check box from device so user can login on another device
 */
exports.device_menu = function(req, res) {

    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    models.device_menu.findAll({
        attributes: ['id', 'title', 'url', 'icon_url', [db.sequelize.fn('concat', req.app.locals.settings.assets_url, db.sequelize.col('icon_url')), 'icon'], 'menu_code', 'position', ['menu_code','menucode']],
        where: {appid: req.auth_obj.appid, isavailable:true},
        order: [[ 'position', 'ASC' ]]
    }).then(function (result) {
        for(var i=0; i<result.length; i++){
            result[i].icon_url = req.app.locals.settings.assets_url+result[i].icon_url;
        }
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        res.send(database_error);
    });
};

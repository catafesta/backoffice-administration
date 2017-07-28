'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    models = db.models;


//RETURNS LIST OF VOD PROGRAMS
/**
 * @api {post} /apiv2/vod/list /apiv2/vod/list
 * @apiVersion 0.2.0
 * @apiName GetVodList
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns video on demand assets/movies
 */
exports.list = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];
    var offset = (!req.body.subset_number || req.body.subset_number === '-1') ? 0 : ((parseInt(req.body.subset_number)-1)*50); //for older versions of vod, start query at first record
    var limit = (!req.body.subset_number || req.body.subset_number === '-1') ? 99999999999 : 50; //for older versions of vod, set limit to 99999999999

    models.vod.findAll({
        attributes: ['id', 'title', 'pin_protected', 'duration', 'description', 'director', 'starring', 'category_id', 'createdAt', 'rate', 'year', 'icon_url', 'image_url'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption']},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true},
        offset: offset,
        limit: limit
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};

            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                        raw_obj.pin_protected = (obj.pin_protected === true) ? 1 : 0;
                        raw_obj.duration = obj.duration;
                        raw_obj.url = obj[k][j].url;
                        raw_obj.description = obj.description + ' Director: ' + obj.director + ' Starring: ' + obj.starring;
                        raw_obj.icon = req.app.locals.settings.assets_url+obj.icon_url;
                        raw_obj.largeimage = req.app.locals.settings.assets_url+obj.image_url;
                        raw_obj.categoryid = String(obj.category_id);
                        raw_obj.dataaded = obj.createdAt.getTime();
                        raw_obj.rate = String(obj.rate);
                        raw_obj.year = String(obj.year);
                        raw_obj.token = null;
                        raw_obj.TokenUrl = null;
                        raw_obj.encryption = obj[k][j].encryption;
                    });
                }
            });
            raw_result.push(raw_obj);
        });
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = raw_result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

//RETURNS FULL LIST OF CATEGORIES
/**
 * @api {post} /apiv2/vod/categories /apiv2/vod/categories
 * @apiVersion 0.2.0
 * @apiName GetVodCategories
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns full list of categories
 */
exports.categories = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_category.findAll({
        attributes: [ 'id', 'name', 'password', 'sorting', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('icon_url')), 'IconUrl'],
            [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('small_icon_url')), 'small_icon_url']],
        where: {password:{in: allowed_content}, isavailable: true}
    }).then(function (result) {
        //type conversation of id from int to string. Setting static values
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
            result[i].toJSON().password = "False";
            result[i].toJSON().pay = "False";
        }
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });
};

//RETURNS ALL SUBTITLES FOR THE SELECTED PROGRAM
/**
 * @api {post} /apiv2/vod/subtitles /apiv2/vod/subtitles
 * @apiVersion 0.2.0
 * @apiName GetVodSubtitles
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiDescription Returns all subtitles list
 */
exports.subtitles = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod_subtitles.findAll({
        attributes: [ ['vod_id', 'vodid'], 'title', [db.sequelize.fn("concat", req.app.locals.settings.assets_url, db.sequelize.col('subtitle_url')), 'url'] ],
        include: [
            { model: models.vod, required: true, attributes: [], where: {pin_protected: {in: allowed_content}, isavailable: true},
                include: [
                    {model: models.vod_stream, required: true, attributes: []},
                    {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
                ]
            }
        ]
    }).then(function (result) {
        //type conversation of id from int to string
        for(var i=0; i< result.length; i++){
            result[i].toJSON().vodid = String(result[i].toJSON().vodid);
        }
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });
};




//RETURNS CLICKS FOR THE SELECTED PROGRAM
/**
 * @api {post} /apiv2/vod/totalhits /apiv2/vod/totalhits
 * @apiVersion 0.2.0
 * @apiName GetVodItemHits
 * @apiGroup DeviceAPI
 *
 * @apiHeader {String} auth Users unique access-key.
 * @apiParam {Number} id_vod VOD item ID
 * @apiDescription Returns clicks/hits for selected vod item.
 */
exports.totalhits = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

     //if hits for a specific movie are requested
    if(req.body.id_vod != "all"){
        models.vod.findAll({
            attributes: [ ['id', 'id_vod'], ['clicks', 'hits'] ],
            where: {id: req.body.id_vod, pin_protected: {in: allowed_content}, isavailable: true},
            include: [
                {model: models.vod_stream, required: true, attributes: []},
                {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
            ]
        }).then(function (result) {
            var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
            clear_response.response_object = result;
            res.send(clear_response);
        }).catch(function(error) {
            var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
            res.send(database_error);
        });
    }
    //return hits for each vod movie
    else{
        models.vod.findAll({
            attributes: [ ['id', 'id_vod'], ['clicks', 'hits'] ],
            where: {pin_protected: {in: allowed_content}, isavailable: true},
            include: [
                {model: models.vod_stream, required: true, attributes: []},
                {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
            ]
        }).then(function (result) {
            var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
            clear_response.response_object = result;
            res.send(clear_response);
        }).catch(function(error) {
            var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
            res.send(database_error);
        });
    }

};

exports.mostwatched = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if hits for a specific movie are requested
    models.vod.findAll({
        attributes: ['id', 'clicks'],
        limit: 30,
        order: [[ 'clicks', 'DESC' ]],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ]
    }).then(function (result) {
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
        }
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

exports.mostrated = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    //if most rated movies are requested
    models.vod.findAll({
        attributes: ['id', 'rate'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        limit: 30,
        order: [[ 'rate', 'DESC' ]],
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ]
    }).then(function (result) {
        var mostrated = [];
        for(var i=0; i< result.length; i++){
            var mostrated_object = {};
            mostrated_object.id = result[i].id;
            mostrated_object.rate = parseInt(result[i].rate);
            mostrated.push(mostrated_object);
        }
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = mostrated;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

exports.related = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        limit: 5
    }).then(function (result) {
        for(var i=0; i< result.length; i++){
            result[i].toJSON().id = String(result[i].toJSON().id);
        }
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

exports.suggestions = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        limit: 10
    }).then(function (result) {
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

exports.categoryfilms = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id'],
        where: {pin_protected: {in: allowed_content}, isavailable: true},
        include: [
            {model: models.vod_stream, required: true, attributes: []},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true, id: req.body.category_id}}
        ]
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            raw_obj.id = String(obj.id);
            raw_result.push(raw_obj);
        });
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = raw_result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

exports.searchvod = function(req, res) {

    var allowed_content = (req.thisuser.show_adult === true) ? [0, 1] : [0];

    models.vod.findAll({
        attributes: ['id', 'title'],
        include: [
            {model: models.vod_stream, required: true, attributes: ['url', 'encryption']},
            {model: models.vod_category, required: true, attributes: [], where:{password:{in: allowed_content}, isavailable: true}}
        ],
        where: {pin_protected:{in: allowed_content}, isavailable: true, title: {like: '%'+req.body.search_string+'%'}}
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        raw_obj.id = String(obj.id);
                        raw_obj.title = obj.title;
                    });
                }
            });
            raw_result.push(raw_obj);
        });
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        clear_response.response_object = raw_result;
        res.send(clear_response);
    }).catch(function(error) {
        var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

exports.resume_movie = function(req, res) {

    //perdor upsert qe nje user te kete vetem 1 film. nese nuk ka asnje te shtohet, ne te kundert te ndryshohet
    models.vod_resume.upsert(
        {
            login_id: req.thisuser.id,
            vod_id: req.body.vod_id,
            resume_position: req.body.resume_position,
            device_id: req.auth_obj.boxid
        }
    ).then(function (result) {
        var clear_response = new response.APPLICATION_RESPONSE(req.body.language, 200, 1, 'OK_DESCRIPTION', 'OK_DATA');
        res.send(clear_response);
    }).catch(function(error) {
        if (error.message.split(': ')[0] === 'ER_NO_REFERENCED_ROW_2'){
            var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'INVALID_INPUT');
        }
        else var database_error = new response.APPLICATION_RESPONSE(req.body.language, 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA');
        res.send(database_error);
    });

};

function delete_resume_movie(user_id, vod_id){

    //perdor upsert qe nje user te kete vetem 1 film. nese nuk ka asnje te shtohet, ne te kundert te ndryshohet
    models.vod_resume.destroy(
        {
            where: {
                login_id: user_id,
                vod_id: vod_id
            }
        }
    ).then(function (result) {
        return null;
    }).catch(function(error) {
       return null;
    });

};

exports.delete_resume_movie = delete_resume_movie;
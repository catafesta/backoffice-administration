'use strict';
var path = require('path'),
    querystring=require('querystring'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    therequest = require('request'),
    models = db.models;

//var

function getlogtime(){
    var d = new Date();
    return d.getDate() + "-" + d.getMonth() + "-"+ d.getFullYear()+" "+ d.getHours()+":"+ d.getMinutes()+":"+ d.getSeconds();
}

//get ipv4 from ipv6
function getipaddress(theip){
    theip = theip.split(":");
    return theip[3];
}

function trackobject(object_data,req, cb) {
   
    object_data.v = 1;
    object_data.tid = req.app.locals.settings.analytics_id;
    object_data.ua = req.headers["user-agent"];
    object_data.cid = req.auth_obj.username;
    object_data.uip = req.ip.replace('::ffff:', '');
    object_data.sr = '568x320'; //screen resolution

    therequest.post(
        'http://www.google-analytics.com/collect', {
            form: object_data
        },
        function(err, response) {
            if (err) { return cb(err); }
            if (response.statusCode !== 200) {
                return cb(new Error('Tracking failed'));
            }
            cb();
        }
    );
}

exports.event = function(req, res) {
    winston.info("Analytics request;"+req.method+";"+req.baseUrl+";"+querystring.stringify(req.body));
    var object_data = {
        t:'event',
        ec: req.body.event_category,
        ea: req.body.event_action,
        el: req.body.event_label,
        ev: parseInt(req.body.event_value) || 1, //req.body.value

        //app values
        an:req.body.app_name, //application name
        av:req.body.appversion, //application version
        aid:req.body.appid, //application id
        cd:req.body.screen_name || null //screen name
    };

    winston.info("Analytics Event:"+querystring.stringify(object_data));

    trackobject(object_data, req, function (err) {
        if (err) {console.log(err)}
    });
    res.send('ok');
};

exports.screen = function(req, res) {
    var object_data = {
        t:'screen',
        an:req.body.app_name, //application name
        av:req.body.appversion, //application version
        aid:req.body.appid, //application id
        cd:req.body.screen_name || null //screen name
    };

    winston.info("Analytics Screen;"+req.method+";"+req.baseUrl+";"+querystring.stringify(req.body));

    trackobject(object_data, req, function (err) {
        if (err) {winston.info(err)}
    });
    res.send('ok');
};

exports.timing = function(req, res) {

    winston.info("Analytics request;"+req.method+";"+req.baseUrl+";"+querystring.stringify(req.body));

    var object_data = {
        t:'timing',
        utc: req.body.event_category,  //timing cateogry
        utv: req.body.event_action,    //timing variable
        utl: req.body.event_label,    //timing label
        utt: req.body.event_value    //timing time

    };
    trackobject(object_data, req, function (err) {
        if (err) {console.log(err)}
    });

    res.send('ok');
};

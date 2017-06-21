'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    Sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    winston = require(path.resolve('./config/lib/winston')),
    dateFormat = require('dateformat'),
    async = require('async'),
    models = db.models;

exports.list = function(req, res) {

    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();

    var qwhere = {};
    if(req.thisuser.show_adult == 0) qwhere.pin_protected = 0; //show adults filter
    else qwhere.pin_protected != '' //avoid adult filter

//find user channels and subscription channels for the user
    models.my_channels.findAll({
        attributes: ['id', 'channel_number', 'genre_id', 'title', 'description', 'stream_url'],
        where: {login_id: req.thisuser.id, isavailable: true},
        include: [{ model: models.genre, required: true, attributes: ['icon_url'], where: {is_available: true} }],
        raw: true
    }).then(function (my_channel_list) {

        models.channels.findAll({
            raw:true,
            attributes: ['id','genre_id', 'channel_number', 'title', 'channel_mode', 'icon_url','pin_protected'],
            where: qwhere,
            include: [
                {model: models.channel_stream,
                    required: true,
                    attributes: ['stream_source_id','stream_url','stream_format','token','token_url','is_octoshape','encryption','encryption_url'],
                    where: {stream_source_id: req.thisuser.channel_stream_source_id}
                },
                { model: models.genre, required: true, attributes: [], where: {is_available: true} },
                {model: models.packages_channels,
                    required: true,
                    attributes:[],
                    include:[
                        {model: models.package,
                            required: true,
                            attributes: [],
                            where: {package_type_id: req.auth_obj.screensize},
                            include:[
                                {model: models.subscription,
                                    required: true,
                                    attributes: [],
                                    where: {login_id: req.thisuser.id, end_date: {$gte: Date.now()}}
                                }
                            ]}
                    ]},
                {model: models.favorite_channels,
                    required: false, //left join
                    attributes: ['id'],
                    where: {user_id: req.thisuser.id},
                },
            ],
        }).then(function (result) {
            var user_channel_list = [];

            for (var i = 0; i < my_channel_list.length; i++) {
                var temp_obj = {};
                temp_obj.id = my_channel_list[i].id;
                temp_obj.channel_number = my_channel_list[i].channel_number;
                temp_obj.title = my_channel_list[i].title;
                temp_obj.icon_url = req.app.locals.settings.assets_url + my_channel_list[i]["genre.icon_url"];
                temp_obj.stream_url = my_channel_list[i]["stream_url"];

                temp_obj.genre_id = my_channel_list[i].genre_id;
                temp_obj.channel_mode = 'live';
                temp_obj.pin_protected = 'false';
                temp_obj.stream_source_id = 1;
                temp_obj.stream_format = "1";
                temp_obj.token = 0;
                temp_obj.token_url = 'http://tibomanager4.tibo.tv/unsecured/token/apiv2/Akamai_token.aspx';
                temp_obj.encryption = 0;
                temp_obj.encryption_url = "0";
                temp_obj.is_octoshape = 0;
                temp_obj.favorite_channel = "0";
                user_channel_list.push(temp_obj)
            }

            for (var i = 0; i < result.length; i++) {
                result[i].icon_url = req.app.locals.settings.assets_url + result[i]["icon_url"];
                result[i].pin_protected = result[i].pin_protected == 0 ? 'false':'true';
                result[i].stream_source_id = result[i]["channel_streams.stream_source_id"]; delete result[i]["channel_streams.stream_source_id"];
                result[i].stream_url = result[i]["channel_streams.stream_url"]; delete result[i]["channel_streams.stream_url"];
                result[i].stream_format = result[i]["channel_streams.stream_format"]; delete result[i]["channel_streams.stream_format"];
                result[i].token = result[i]["channel_streams.token"]; delete result[i]["channel_streams.token"];
                result[i].token_url = result[i]["channel_streams.token_url"]; delete result[i]["channel_streams.token_url"];
                result[i].encryption = result[i]["channel_streams.encryption"]; delete result[i]["channel_streams.encryption"];
                result[i].encryption_url = result[i]["channel_streams.encryption_url"]; delete result[i]["channel_streams.encryption_url"];
                result[i].is_octoshape = result[i]["channel_streams.is_octoshape"]; delete result[i]["channel_streams.is_octoshape"];
                result[i].favorite_channel = result[i]["favorite_channels.id"] ? "1":"0"; delete result[i]["favorite_channels.id"];
            }

            clear_response.response_object = result.concat(user_channel_list);
            res.send(clear_response);

        }).catch(function(error) {
            res.send(database_error);
        });
        return null;
    }).catch(function(error) {
        res.send(database_error);
    });

};

// returns list of genres
exports.genre = function(req, res) {
    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    models.genre.findAll({
        attributes: ['id',['description', 'name']],
        where: {is_available: true}
    }).then(function (result) {
        clear_response.response_object = result;
        res.send(clear_response);
    }).catch(function(error) {
        res.send(database_error);
    });
};

// returns list of all epg data
exports.epg = function(req, res) {
    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    var client_timezone = req.body.device_timezone;
    //request parameters: list of channel numbers for the epg, timeshift
    var channel_number = req.body.number.toString().split(',');
    var timeshift = req.body.timeshift;

    var starttime = dateFormat((Date.now() + (parseInt(timeshift) + 2) * 3600000), "yyyy-mm-dd HH:MM:ss");
    var endtime   = dateFormat((Date.now() + (parseInt(timeshift) - 2) * 3600000), "yyyy-mm-dd HH:MM:ss");

    //gets epg of the channels from the list for the next 4 hours starting from timeshift
    models.epg_data.findAll({
        attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end' ],
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'channel_number'],
                where: {channel_number: {in: channel_number}} //limit data only for this list of channels
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],	where: {login_id: req.thisuser.id}
            }
        ],
        where: Sequelize.and(
            Sequelize.or(
                {program_start:{between:[starttime, endtime]}},
                {program_end: {between:[starttime, endtime]}},
                Sequelize.and(
                    {program_start: {lte:starttime}},
                    {program_end:{gte:endtime}}
                )
            )
        )
    }).then(function (result) {
        var raw_result = [];
        //flatten nested json array
        result.forEach(function(obj){
            var raw_obj = {};
            Object.keys(obj.toJSON()).forEach(function(k) {
                if (typeof obj[k] == 'object') {
                    Object.keys(obj[k]).forEach(function(j) {
                        if(j === 'dataValues'){
                            var programstart = parseInt(obj.program_start.getTime()) +  parseInt(client_timezone * 3600000);
                            var programend = parseInt(obj.program_end.getTime()) +  parseInt(client_timezone * 3600000);

                            raw_obj.channelName = obj[k].title;
                            raw_obj.number = obj[k].channel_number;
                            raw_obj.id = obj.id;
                            raw_obj.scheduled = (obj.program_schedules[0]) ? true : false;
                            raw_obj.title = obj.title;
                            raw_obj.description = obj.short_description;
                            raw_obj.shortname = obj.short_name;
                            raw_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                            raw_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                            raw_obj.duration = obj.duration_seconds;
                        }
                    });
                }
            });
            raw_result.push(raw_obj);
        });

        clear_response.response_object = raw_result;
        res.send(clear_response);
    }).catch(function(error) {
        res.send(database_error);
    });

};

// returns list of epg data for the given channel
exports.event =  function(req, res) {
    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    var client_timezone = req.body.device_timezone; //offset of the client will be added to time - related info
    var current_human_time = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"); //get current time to compare with enddate
    var interval_end_human = dateFormat((Date.now() + 43200000), "yyyy-mm-dd HH:MM:ss"); //get current time to compare with enddate, in the interval of 12 hours
    var channel_title = '';

    models.channels.findOne({
        attributes: ['title'],
        where: {channel_number: req.body.channelNumber}
    }).then(function (thischannel) {
        if(thischannel) channel_title = thischannel.title;
        models.my_channels.findOne({
            attributes: ['title'],
            where: {channel_number: req.body.channelNumber}
        }).then(function (user_channel) {
            if(user_channel) channel_title = user_channel.title;
            models.epg_data.findAll({
                attributes: [ 'id', 'title', 'short_description', 'short_name', 'duration_seconds', 'program_start', 'program_end' ],
                order: [['program_start', 'ASC']],
                limit: 3,
                include: [
                    {
                        model: models.channels, required: true, attributes: ['title', 'channel_number'],
                        where: {channel_number: req.body.channelNumber} //limit data only for this channel
                    },
                    {model: models.program_schedule,
                        required: false, //left join
                        attributes: ['id'],
                        where: {login_id: req.thisuser.id}
                    }
                ],
                where: Sequelize.and(
                    {program_start: {lte: interval_end_human}},
                    Sequelize.or(
                        Sequelize.and(
                            {program_start:{lte:current_human_time}},
                            {program_end:{gte:current_human_time}}
                        ),
                        Sequelize.and(
                            {program_start: {gte:current_human_time}},
                            {program_end:{lte:interval_end_human}}
                        )
                    )
                )
            }).then(function (result) {
                //todo: what if channel number is invalid and it finds no title???
                var raw_result = [];
                var default_programs = [];
                //flatten nested json array
                result.forEach(function(obj){
                    var raw_obj = {};

                    Object.keys(obj.toJSON()).forEach(function(k) {
                        if (typeof obj[k] == 'object') {
                            Object.keys(obj[k]).forEach(function(j) {
                                var programstart = parseInt(obj.program_start.getTime()) +  parseInt((client_timezone) * 3600000);
                                var programend = parseInt(obj.program_end.getTime()) +  parseInt((client_timezone) * 3600000);

                                raw_obj.channelName = obj[k].title;
                                raw_obj.id = obj.id;
                                raw_obj.number = obj[k].channel_number;
                                raw_obj.title = obj.title;
                                raw_obj.scheduled = (obj.program_schedules[0]) ? true : false;
                                raw_obj.description = obj.short_description;
                                raw_obj.shortname = obj.short_name;
                                raw_obj.programstart = dateFormat(programstart, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                                raw_obj.programend = dateFormat(programend, 'mm/dd/yyyy HH:MM:ss'); //add timezone offset to program_start timestamp, format it as M/D/Y H:m:s
                                raw_obj.duration = obj.duration_seconds;
                                raw_obj.progress = Math.round((Date.now() - obj.program_start.getTime() ) * 100 / (obj.program_end.getTime() - obj.program_start.getTime()));
                            });
                        }
                    });
                    raw_result.push(raw_obj);
                });

                if(result.length <3){
                    for(var i=0; i<3-result.length; i++){
                        var temp_obj = {};
                        temp_obj.channelName = channel_title;
                        temp_obj.id = -1;
                        temp_obj.number = req.body.channelNumber;
                        temp_obj.title = "Program of "+channel_title;
                        temp_obj.scheduled = false;
                        temp_obj.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
                        temp_obj.shortname = "Program of "+channel_title;
                        temp_obj.programstart = '01/01/1970 00:00:00';
                        temp_obj.programend = '01/01/1970 00:00:00';
                        temp_obj.duration = 0;
                        temp_obj.progress = 0;
                        raw_result.push(temp_obj);
                    }
                }
                clear_response.response_object = raw_result;
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

//API for favorites. Performs a delete or insert - depending on the action parameter.
exports.favorites = function(req, res) {

    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();

    async.waterfall([
        //GETTING USER DATA
        function(callback) {
            models.login_data.findOne({
                attributes: ['id'], where: {username: req.auth_obj.username}
            }).then(function (user) {
                callback(null, user.id);
                return null;
            }).catch(function(error) {
                res.send(database_error);
            });
        },
        function(user_id, callback) {
            models.channels.findOne({
                attributes: ['id'], where: {channel_number: req.body.channelNumber}
            }).then(function (channel) {
                callback(null, user_id, channel.id);
                return null;
            }).catch(function(error) {
                res.send(database_error);
            });
        },
        function(user_id, channel_id) {
            if(req.body.action == "1"){
                models.favorite_channels.create({
                    channel_id: channel_id,
                    user_id: user_id
                }).then(function (result) {
                    clear_response.extra_data = "user "+req.auth_obj.username+" action "+req.body.action+" channel "+req.body.channelNumber;
                    res.send(clear_response);
                }).catch(function(error) {
                    //TODO: separate unique_key_violation from generic or connection errors
                    res.send(database_error);
                });
            }
            else if(req.body.action == "0"){
                models.favorite_channels.destroy({
                    where: {
                        channel_id: channel_id,
                        user_id: user_id
                    }
                }).then(function (result) {
                    clear_response.extra_data = "user "+req.auth_obj.username+" action "+req.body.action+" channel "+req.body.channelNumber;
                    res.send(clear_response);
                }).catch(function(error) {
                    res.send(database_error);
                });
            }
        }
    ], function (err) {
        res.send(database_error);
    });
};

//API for scheduling.
exports.program_info = function(req, res) {

    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    models.epg_data.findOne({
        attributes: ['title', 'long_description', 'program_start', 'program_end'],
        where: {id: req.body.program_id},
        include: [
            {
                model: models.channels, required: true, attributes: ['title', 'description'],
                include: [{
                    model: models.genre, required: true, attributes: [ 'description']
                }]
            },
            {model: models.program_schedule,
                required: false, //left join
                attributes: ['id'],
                where: {login_id: req.thisuser.id}
            }
        ]
    }).then(function (epg_program) {
        if(!epg_program){
            clear_response.response_object = [{
                "genre": '',
                "program_title": '',
                "program_description": '',
                "channel_title": '',
                "channel_description": '',
                "status": '',
                "scheduled": false
            }];
        }
        else {
            var status = '';
            if (epg_program.program_start.getTime() > Date.now()) {
                status = 'future';
            }
            else if (epg_program.program_end.getTime() < Date.now()) {
                status = 'catchup';
            }
            else {
                status = 'live';
            }

            clear_response.response_object = [{
                "genre": (epg_program.channel.genre.description) ? epg_program.channel.genre.description : '',
                "program_title": (epg_program.title) ? epg_program.title : '',
                "program_description": (epg_program.long_description) ? epg_program.long_description : '',
                "channel_title": (epg_program.channel.title) ? epg_program.channel.title : '',
                "channel_description": (epg_program.channel.description) ? epg_program.channel.description : '',
                "status": status,
                "scheduled": (epg_program.program_schedules[0]) ? true : false
            }];
        }
        res.send(clear_response)
    }).catch(function(error) {
        res.send(database_error);
    });

};

//API for scheduling.
exports.schedule = function(req, res) {

    var clear_response = new response.OK();
    var database_error = new response.DATABASE_ERROR();
    models.epg_data.findOne({
        attributes: ['id'],
        where: {id: req.body.program_id}
    }).then(function (epg_program) {
        if(epg_program){
            models.program_schedule.findOne({
                attributes: ['id'], where: {login_id: req.thisuser.id, program_id: req.body.program_id},
            }).then(function (scheduled) {
                if(!scheduled){
                    models.program_schedule.create({
                        login_id: req.thisuser.id,
                        program_id: req.body.program_id
                    }).then(function (scheduled){
                        clear_response.response_object = [{
                            "action": 'created'
                        }];
                        res.send(clear_response);
                    }).catch(function(error) {
                        res.send(database_error);
                    });
                }
                else{
                    models.program_schedule.destroy({
                        where: {login_id: req.thisuser.id, program_id: req.body.program_id}
                    }).then(function (scheduled){
                        clear_response.response_object = [{
                            "action": 'destroyed'
                        }];
                        res.send(clear_response);
                    }).catch(function(error) {
                        res.send(database_error);
                    });
                }
            }).catch(function(error) {
                res.send(database_error);
            });
        }
        else{
            clear_response.response_object = [{
                "action": 'no action'
            }];
            res.send(clear_response);
        }
        return null;
    }).catch(function(error) {
        res.send(database_error);
    });

};
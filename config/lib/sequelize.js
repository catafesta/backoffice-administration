"use strict";

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Sequelize = require('sequelize'),
    winston = require('./winston'),
    async = require('async'),
    db = {},
    http = require('http'),
    https = require('https'),
    chalk = require('chalk'),
    randomstring = require('randomstring'),
    authentication = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller'));

const os = require('os');
const api_list = require(path.resolve("./config/api_list.json"));

db.Sequelize = Sequelize;
db.models = {};
db.discover = [];

// Expose the connection function
db.connect = function(database, username, password, options) {

    if (typeof db.logger === 'function')
        winston.info("Connecting to: " + database + " as: " + username);

    // Instantiate a new sequelize instance
    var sequelize = new db.Sequelize(database, username, password, options);

    db.discover.forEach(function(location) {
        var model = sequelize["import"](location);
        if (model)
            db.models[model.name] = model;
    });

    sequelize.authenticate().then(function(results) {

        // Execute the associate methods for each Model
        Object.keys(db.models).forEach(function(modelName) {
            if (db.models[modelName].options.hasOwnProperty('associate')) {
                db.models[modelName].options.associate(db.models);
                winston.info("Associating Model: " + modelName);
            }
        });

        if (config.db.sync) {
            //sequelize.sync({force: true}) //deletes datbase and recreates
            sequelize.sync()
                .then(function() {
                    async.waterfall([
                        //create admin group
                        function(callback){
                            db.models['groups'].findOrCreate({
                                where: {code: 'admin'},
                                defaults: {
                                    name: 'Administrator',
                                    code: 'admin',
                                    isavailable: 1
                                }
                            }).then(function(group) {
                                winston.info('Admin group created successfully');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Admin group');
                                callback(null);
                            });
                        },
                        //create admin user
                        function(callback) {
                            var salt = randomstring.generate(64);
                            db.models['users'].findOrCreate({
                                where: {username: 'admin'},
                                defaults: {
                                    username: 'admin',
                                    password: 'admin',
                                    hashedpassword: authentication.encryptPassword('admin', salt),
                                    salt: salt,
                                    isavailable: 1,
                                    group_id: 1
                                }
                            }).then(function(user) {
                                winston.info('Admin user created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Admin user');
                                callback(null);
                            });
                        },
                        //create settings record
                        function(callback){
                            db.models['settings'].findOrCreate({
                                where: {id:1},
                                defaults: {
                                    id: 1,
                                    email_address: 'norely@demo.com',
                                    email_username: 'username',
                                    email_password: 'password',
                                    assets_url: os.hostname(),
                                    activity_timeout: 10800,
                                    channel_log_time:6,
                                    log_event_interval:300,
                                    vodlastchange: Date.now(),
                                    livetvlastchange: Date.now(),
                                    menulastchange: Date.now()
                                }
                            }).then(function(settins) {
                                winston.info('Settings created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.error("An error occured: %j", err);
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['activity'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,description:'livetv'}
                            }).then(function(done) {
                                winston.info('Activity livetv created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating activity livetv');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['activity'].findOrCreate({
                                where: {id: 2},
                                defaults: {id:2,description:'vod'}
                            }).then(function(done) {
                                winston.info('Activity vod created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating activity vod');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['activity'].findOrCreate({
                                where: {id: 3},
                                defaults: {id:3,description:'catchup'}
                            }).then(function(done) {
                                winston.info('Activity catchup created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating activity catchup');
                                callback(null);
                            });
                        },
                        //crating appilcation IDs ---------------------------------------------------------------------
                        function(callback){
                            db.models['app_group'].findOrCreate({
                                where: {app_id: 1},
                                defaults: {id:1,app_group_name:'Large Screen',app_id:1,app_group_id:1}
                            }).then(function(done) {
                                winston.info('Application ID 1 created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating aplication ID 1');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['app_group'].findOrCreate({
                                where: {app_id: 2},
                                defaults: {id:2,app_group_name:'Small Screen',app_id:2,app_group_id:2}
                            }).then(function(done) {
                                winston.info('Application ID 2 created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating aplication ID 2');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['app_group'].findOrCreate({
                                where: {app_id: 3},
                                defaults: {id:3,app_group_name:'Small Screen',app_id:3,app_group_id:2}
                            }).then(function(done) {
                                winston.info('Application ID 3 created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating aplication ID 1');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['app_group'].findOrCreate({
                                where: {app_id: 4},
                                defaults: {id:4,app_group_name:'Large Screen',app_id:4,app_group_id:1}
                            }).then(function(done) {
                                winston.info('Application ID 4 created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating aplication ID 4');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['app_group'].findOrCreate({
                                where: {app_id: 5},
                                defaults: {id:5,app_group_name:'Large Screen',app_id:5,app_group_id:1}
                            }).then(function(done) {
                                winston.info('Application ID 5 created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating aplication ID 5');
                                callback(null);
                            });
                        },
                        //create deafult package types
                        function(callback){
                            db.models['package_type'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,description: 'Live TV STB Package', activity_id: 1, app_group_id: 1}
                            }).then(function(done) {
                                winston.info('Live TV STB Package created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Live TV STB Package');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['package_type'].findOrCreate({
                                where: {id: 2},
                                defaults: {id:2,description: 'Live TV Mobile Package', activity_id: 1, app_group_id: 2}
                            }).then(function(done) {
                                winston.info('Live TV Mobile Package created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Live TV Mobile Package');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['package_type'].findOrCreate({
                                where: {id: 3},
                                defaults: {id:3,description: 'VOD STB Package', activity_id: 2, app_group_id: 1}
                            }).then(function(done) {
                                winston.info('VOD STB Package created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating VOD STB Package');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['package_type'].findOrCreate({
                                where: {id: 4},
                                defaults: {id:4,description: 'VOD Mobile Package', activity_id: 2, app_group_id: 2}
                            }).then(function(done) {
                                winston.info('VOD Mobile Package created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating VOD Mobile Package');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['genre'].findOrCreate({
                                where: {id: 666},
                                defaults: {id:666,description: 'Favorites', is_available: true, icon_url: 'favoritesicon'}
                            }).then(function(done) {
                                winston.info('Genre Favorites created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating Genre Favorites');
                                callback(null);
                            });
                        },
                        function(callback){
                            async.forEachOf(api_list, function (value, key, callback) {
                                db.models['api_group'].findOrCreate({
                                    where: {api_group_name: value.api_group},
                                    defaults: {api_group_name: value.api_group, description: value.description}
                                }).then(function(api_group) {
                                    winston.info('Api group record created successfully');
                                    async.forEachOf(api_list[key].api_urls, function (apivalue, apikey, callback) {
                                        db.models['api_url'].findOrCreate({
                                            where: {api_url: apivalue.api_url, api_group_id: api_group[0].id},
                                            defaults: {api_url: apivalue.api_url, description: apivalue.description, api_group_id: api_group[0].id}
                                        }).then(function(done) {
                                            winston.info('Api record created successfully');
                                            callback(null);
                                            return null;
                                        }).catch(function(err) {
                                            console.log(err);
                                            winston.info('Error creating Api record');
                                            callback(null);
                                        });
                                        return null;
                                    }, function (err) {
                                        if(err) {
                                            winston.info('Error creating Api records');
                                            callback(null);
                                        }
                                    });
                                    return null;
                                }).catch(function(err) {
                                    console.log(err);
                                    winston.info('Error creating Api group record');
                                    callback(null);
                                });
                            }, function (err) {
                                if(err){
                                    winston.info('Error creating Api group record');
                                    callback(null);
                                }
                            });
                        },
                        function(callback){
                            db.models['vod_stream_source'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,description: 'VOD Streams Primary CDN'}
                            }).then(function(done) {
                                winston.info('VOD stream source created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.info('Error creating VOD stream source');
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['channel_stream_source'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,stream_source: 'Live Streams Primary CDN'}
                            }).then(function(done) {
                                winston.info('Live TV stream source created successfully.');
                                callback(null);
                            }).catch(function(err) {
                                winston.info('Error creating Live TV stream source');
                                callback(null);
                            });
                        },
                        function(callback){
                            var protocol = (config.port === 443) ? 'https://' : 'http://'; //port 443 means we are running https, otherwise we are running http (preferably on port 80)
                            var baseurl = process.env.NODE_HOST || 'localhost' + ":" + config.port;
                            var apiurl = (baseurl == 'localhost:'+config.port) ? protocol+baseurl+'/apiv2/schedule/reload' : baseurl+'/apiv2/schedule/reload'; //api path

                            console.log(apiurl)

                            try {
                                if(config.port === 443){
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //invalid ssl certificate ignored
                                    https.get(apiurl, function(resp){
                                        callback(null);
                                    }).on("error", function(e){
                                        console.log("error1")
                                        console.log(e)
                                        callback(null); //return offset 0 to avoid errors
                                    });
                                }
                                else{
                                    http.get(apiurl, function(resp){
                                        callback(null);
                                    }).on("error", function(e){
                                        console.log("error1")
                                        console.log(e)
                                        callback(null); //return offset 0 to avoid errors
                                    });
                                }

                            } catch(e) {
                                console.log("error2")
                                console.log(e)
                                callback(null); //catch error 'Unable to determine domain name' when url is invalid / key+service are invalid
                            }
                        }
                    ],function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                    winston.info("Database synchronized");
                    return null;
                }).catch(function(err) {
                winston.error("An error occured: %j", err);
            });
        }
        return null;
    }).catch(function(error) {
        winston.error("Error connecting to database");
        console.log(error);
        /*
        if(error.message.split(':', 1)[0] === "ER_BAD_DB_ERROR"){
            //database does not exist
            //todo: create database here
        }
        else {
            winston.error("Error connecting to database");
            console.log(error)
        }
        */
    });

    db.sequelize = sequelize;
    winston.info("Finished Connecting to Database");
    return true;
};

module.exports = db;

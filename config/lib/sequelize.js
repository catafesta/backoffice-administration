"use strict";

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Sequelize = require('sequelize'),
    winston = require('./winston'),
    async = require('async'),
    db = {};

const os = require('os');

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
                            winston.info('Admin group created successfuly');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating Admin group');
                            callback(null);
                        });
                    },
                    //create admin user
                    function(callback) {
                        db.models['users'].findOrCreate({
                            where: {username: 'admin'},
                            defaults: {
                                username: 'admin',
                                password: 'admin',
                                isavailable: 1,
                                group_id: 1
                            }
                        }).then(function(user) {
                            winston.info('Admin user created successfuly.');
                            callback(null);
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
                                email_address: 'noreply@demo.com',
                                email_username: 'username',
                                email_password: 'password',
                                assets_url: os.hostname(),
                                activity_timeout: 10800,
                                channel_log_time:6,
                                log_event_interval:300,
                                vodlastchange: Date.now(),
                                livetvlastchange: Date.now(),
                                menulastchange: Date.now(),
                                old_encryption_key: 'old_encryption_key',
                                new_encryption_key: 'new_encryption_key'
                            }
                        }).then(function(settins) {
                            winston.info('Settings created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.error("An error occured: %j", err);
                            callback(null);
                        });
                    },
                    //create deafult package types
                    function(callback){
                        db.models['activity'].findOrCreate({
                            where: {id: 1},
                            defaults: {id:1,description: 'livetv'}
                        }).then(function(done) {
                            winston.info('livetv activity created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating livetv activity');
                            callback(null);
                        });
                    },
                    //create deafult package types
                    function(callback){
                        db.models['activity'].findOrCreate({
                            where: {id: 2},
                            defaults: {id:2,description: 'vod'}
                        }).then(function(done) {
                            winston.info('vod activity created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating vod activity');
                            callback(null);
                        });
                    },
                    //create deafult package types
                    function(callback){
                        db.models['package_type'].findOrCreate({
                            where: {id: 1},
                            defaults: {id:1,description: 'Live TV STB Package', activity_id: 1, app_group_id: 1}
                        }).then(function(done) {
                            winston.info('Live TV STB Package created successfuly.');
                            callback(null);
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
                            winston.info('Live TV Mobile Package created successfuly.');
                            callback(null);
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
                            winston.info('VOD STB Package created successfuly.');
                            callback(null);
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
                            winston.info('VOD Mobile Package created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating VOD Mobile Package');
                            callback(null);
                        });
                    },
                    function(callback){
                        db.models['genre'].findOrCreate({
                            where: {id: 666},
                            defaults: {id:666,description: 'Favorites'}
                        }).then(function(done) {
                            winston.info('Genre Favorites created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating Genre Favorites');
                            callback(null);
                        });
                    },
                    function(callback){
                        db.models['vod_stream_source'].findOrCreate({
                            where: {id: 1},
                            defaults: {id:1,description: 'VOD Streams Primary CDN'}
                        }).then(function(done) {
                            winston.info('VOD stream source created successfuly.');
                            callback(null);
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
                            winston.info('Live TV stream source created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating Live TV stream source');
                            callback(null);
                        });
                    },
                    //crating appilcation IDs ---------------------------------------------------------------------
                    function(callback){
                        db.models['app_group'].findOrCreate({
                            where: {app_id: 1},
                            defaults: {id:1,app_group_name:'Large Screen',app_id:1,app_group_id:1}
                        }).then(function(done) {
                            winston.info('Application ID 1 created successfuly.');
                            callback(null);
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
                            winston.info('Application ID 2 created successfuly.');
                            callback(null);
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
                            winston.info('Application ID 3 created successfuly.');
                            callback(null);
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
                            winston.info('Application ID 4 created successfuly.');
                            callback(null);
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
                            winston.info('Application ID 5 created successfuly.');
                            callback(null);
                        }).catch(function(err) {
                            winston.info('Error creating aplication ID 5');
                            callback(null);
                        });
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

    db.sequelize = sequelize;

    winston.info("Finished Connecting to Database");

    return true;
};

module.exports = db;

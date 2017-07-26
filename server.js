'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
var dbfile = path.resolve("./config/env/db.connection.js");

global.languages = {};
const language_folder_path = './config/languages/';

async.waterfall([
    function(callback){
        try{
            fs.readdir(language_folder_path, function(err, files){
                console.log(files);
                files.forEach(function(file){
                    var lang = require(path.resolve(language_folder_path+file));
                    if(lang.language_code && lang.language_name && lang.language_variables)
                        global.languages[''+lang.language_code+''] = lang;
                });
				console.log(languages);
			});
        }catch(error){
            console.log(error);
        }
        callback(null);
    },
    function(callback){
       //check if db file exists
        if (fs.existsSync(dbfile)) {
            console.log('database configuration file exists');
            callback(null);
        }
        else {

            console.log("Database configuration file not found, please enter information below");

             prompt.properties = {
                    username: {
                        message: 'Username cannot be blank',
                        description: 'Enter database username',
                        required: true
                    },
                    password: {
                        description: 'Enter database password',
                    },
                    host: {
                        message: 'Hostname cannot be blank',
                        description: 'Enter database host address',
                        required: true,
                    },
                    database: {
                        message: 'Database cannot be blank',
                        description: 'Enter database name',
                        required: true,
                    }
                };

                prompt.message = "";
                prompt.start();

                prompt.get(['username', 'password','host','database'], function (err, result) {

                var configfile = 'module.exports = { \n'   +
                                        'name: process.env.DB_NAME || "' + result.database + '", \n' +
                                        'host: process.env.DB_HOST || "' + result.host + '",  \n ' +
                                        'port: process.env.DB_PORT || 3306, //5432, \n ' +
                                        'username: process.env.DB_USERNAME || "' + result.username + '",  \n' +
                                        'password: process.env.DB_PASSWORD || "' + result.password + '",  \n' +
                                        'dialect: process.env.DB_DIALECT || "mysql", //mysql, postgres, sqlite3,... \n' +
                                        'storage: "./db.development.sqlite", \n' +
                                        'enableSequelizeLog: process.env.DB_LOG || true, \n' +
                                        'ssl: process.env.DB_SSL || false,   \n' +
                                        'sync: process.env.DB_SYNC || true //Synchronizing any model changes with database \n' +
                                        '};';

                fs.writeFile(dbfile, configfile, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("Configuration file saved !");
                    callback(null);
                });

            });
        }
    },
    function(callback){
        console.log('entering seccond function');
        callback(null);
    },
    function(callback){
        console.log('entering third function');
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
    console.log('-------------------------------------Starting server--------------------------------------------------------');
    var app = require('./config/lib/app');
    var server = app.start();
});
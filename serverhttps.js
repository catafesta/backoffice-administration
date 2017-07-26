'use strict';

//production
process.env.NODE_ENV = 'production';

var async = require('async');
var fs = require('fs');
var path = require('path');

var app = require('./config/lib/app');

global.languages = {};
const language_folder_path = './config/languages/';

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


var server = app.start();


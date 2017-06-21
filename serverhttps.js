'use strict';

//production
process.env.NODE_ENV = 'production';

var app = require('./config/lib/app');

var server = app.start();


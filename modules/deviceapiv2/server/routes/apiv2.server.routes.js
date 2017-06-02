'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    authpolicy = require('../auth/apiv2.server.auth.js'),
    credentialsController = require(path.resolve('./modules/deviceapiv2/server/controllers/credentials.server.controller')),
    channelsController = require(path.resolve('./modules/deviceapiv2/server/controllers/channels.server.controller')),
    scheduleController = require(path.resolve('./modules/deviceapiv2/server/controllers/schedule.server.controller')),
    vodController = require(path.resolve('./modules/deviceapiv2/server/controllers/vod.server.controller')),
    settingsController = require(path.resolve('./modules/deviceapiv2/server/controllers/settings.server.controller')),
    networkController = require(path.resolve('./modules/deviceapiv2/server/controllers/network.server.controller')),
    eventlogsController = require(path.resolve('./modules/deviceapiv2/server/controllers/eventlogs.server.controller')),
    passwordController = require(path.resolve('./modules/deviceapiv2/server/controllers/password.server.controller')),
    mainController = require(path.resolve('./modules/deviceapiv2/server/controllers/main.server.controller')),
    customersAppController = require(path.resolve('./modules/deviceapiv2/server/controllers/customers_app.server.controller')),
	sitesController = require(path.resolve('./modules/deviceapiv2/server/controllers/sites.server.controller')),
	headerController = require(path.resolve('./modules/deviceapiv2/server/controllers/header.server.controller')),
    winston = require(path.resolve('./config/lib/winston'));


module.exports = function(app) {

    app.route('/apiv2/schedule/reload')
        .get(scheduleController.reload_scheduled_programs);

    app.use('/apiv2',function (req, res, next) {
        winston.info(req.originalUrl +'  '+ JSON.stringify(req.body));
		res.header("Access-Control-Allow-Origin", "*");
        next();
    });


    /* ===== login data credentials===== */
    app.route('/apiv2/credentials/login')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(credentialsController.login);

    app.route('/apiv2/credentials/logout')
        .all(authpolicy.isAllowed)
        .post(credentialsController.logout);
    app.route('/apiv2/credentials/logout_user')
        .all(authpolicy.isAllowed)
        .post(credentialsController.logout_user);

    //channels
    app.route('/apiv2/channels/list')
       .all(authpolicy.isAllowed)
       .all(authpolicy.getthisuserdetails)
       .post(channelsController.list);

    app.route('/apiv2/channels/genre')
        .all(authpolicy.isAllowed)
        .post(channelsController.genre);

    app.route('/apiv2/channels/epg')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(channelsController.epg);

    app.route('/apiv2/channels/event')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(channelsController.event);

    app.route('/apiv2/channels/favorites')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(channelsController.favorites);
    app.route('/apiv2/channels/program_info')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(channelsController.program_info);
    app.route('/apiv2/channels/schedule')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(channelsController.schedule);


    //vod set top box
    app.route('/apiv2/vod/list')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.list);
    app.route('/apiv2/vod/categories')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.categories);
    app.route('/apiv2/vod/subtitles')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.subtitles);
	app.route('/apiv2/vod/totalhits')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.totalhits);

    app.route('/apiv2/vod/mostwatched')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.mostwatched);
    app.route('/apiv2/vod/mostrated')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.mostrated);
    app.route('/apiv2/vod/related')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.related);
    app.route('/apiv2/vod/suggestions')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.suggestions);
    app.route('/apiv2/vod/categoryfilms')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.categoryfilms);
    app.route('/apiv2/vod/searchvod')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.searchvod);
    app.route('/apiv2/vod/resume_movie')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(authpolicy.isAllowed,vodController.resume_movie);

    //settings
    app.route('/apiv2/settings/settings')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(settingsController.settings);

    app.route('/apiv2/settings/upgrade')
        .all(authpolicy.isAllowed)
        .post(settingsController.upgrade);

    //main device menu
    app.route('/apiv2/main/device_menu')
        .all(authpolicy.isAllowed)
        .post(mainController.device_menu);

    /*******************************************************************
                         Network - related API
     *******************************************************************/
    app.route('/apiv2/network/dbtest')
        .all(authpolicy.isAllowed)
        .post(networkController.dbtest);

    app.route('/apiv2/network/gcm')
        .all(authpolicy.isAllowed)
        .post(networkController.gcm);

    //event logs
    app.route('/apiv2/events/event')
        .all(authpolicy.isAllowed)
        .post(eventlogsController.event);

    app.route('/apiv2/events/screen')
        .all(authpolicy.isAllowed)
        .post(eventlogsController.screen);

    app.route('/apiv2/events/timing')
        .all(authpolicy.isAllowed)
        .post(eventlogsController.timing);


    /*******************************************************************
     User personal data for application
     *******************************************************************/
    app.route('/apiv2/customer_app/settings')
        .all(authpolicy.isAllowed)
        .post(customersAppController.user_settings);
    app.route('/apiv2/customer_app/user_data')
        .all(authpolicy.isAllowed)
        .post(customersAppController.user_data);

    app.route('/apiv2/customer_app/update_user_data')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(customersAppController.update_user_data);
    app.route('/apiv2/customer_app/update_user_settings')
        .all(authpolicy.isAllowed)
        .post(customersAppController.update_user_settings);
    app.route('/apiv2/customer_app/change_password')
        .all(authpolicy.isAllowed)
        .post(customersAppController.change_password);
    app.route('/apiv2/customer_app/reset_pin')
        .all(authpolicy.isAllowed)
        .all(authpolicy.getthisuserdetails)
        .post(customersAppController.reset_pin);

    app.route('/apiv2/customer_app/salereport')
        .all(authpolicy.isAllowed)
        .post(customersAppController.salereport);

    app.route('/apiv2/customer_app/subscription')
        .all(authpolicy.isAllowed)
        .post(customersAppController.subscription);

    app.route('/apiv2/customer_app/channel_list')
        .all(authpolicy.isAllowed)
        .post(customersAppController.channel_list);
    app.route('/apiv2/customer_app/add_channel')
        .all(authpolicy.isAllowed)
        .post(customersAppController.add_channel);
    app.route('/apiv2/customer_app/delete_channel')
        .all(authpolicy.isAllowed)
        .post(customersAppController.delete_channel);
    app.route('/apiv2/customer_app/edit_channel')
        .all(authpolicy.isAllowed)
        .post(customersAppController.edit_channel);


	/* ===== websites ===== */
    //todo: only one of the paths is in use
    app.route('/apiv2/sites_web/registration')
        .post(sitesController.createaccount);
    app.route('/apiv2/sites/registration')
        .post(sitesController.createaccount);


    app.route('/apiv2/sites/confirm-account/:token')
        .get(sitesController.confirmNewAccountToken);


    /* ===== header logs ===== */
    app.route('/apiv2/header/header')
        .all(authpolicy.isAllowed)
        .get(headerController.header);

    /* ===== login data reset password ===== */
    app.route('/apiv2/password/forgot')
          .post(passwordController.forgot);

    app.route('/apiv2/password/reset/:token')
        .get(passwordController.validateResetToken);
};

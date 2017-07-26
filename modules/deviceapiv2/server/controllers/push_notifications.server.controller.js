'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    apn = require('apn'),
    gcm = require('node-gcm'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.messages,
    DBDevices = db.devices;

//TODO: Consider appid 4 and 5
function sendiosnotification(obj,messagein,ttl, action) {

    // Set up apn with the APNs Auth Key
    var apnProvider = new apn.Provider({
        token: {
            key: path.resolve('config/sslcertificate/IOS_APNs_82X366YY8N.p8'), // Path to the key p8 file
            keyId: '82X366YY8N', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: 'RY4R7JL9MP', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: true // Set to true if sending a notification to a production iOS app
    });

    var deviceToken = obj.googleappid; // Enter the device token from the Xcode console
    var notification = new apn.Notification(); // Prepare a new notification
    notification.topic = 'com.magoware.webtv'; // Specify your iOS app's Bundle ID (accessible within the project editor)
    notification.expiry = Math.floor(Date.now() / 1000) + ttl; // Set expiration to 1 hour from now (in case device is offline)
    notification.badge = 2; // Set app badge indicator
    notification.sound = 'ping.aiff'; // Play ping.aiff sound when the notification is received
    notification.alert = messagein; // Display the following message (the actual notification text, supports emoji)
    notification.payload = {id: 123}; // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification

// Actually send the notification
    apnProvider.send(notification, deviceToken).then(function(result) {
        // Check the result for any failed devices
    });
}

function sendandoirdnotification(obj, messagein, ttl, action, callback) {
//function sendandoirdnotification(action, googleappids, ttl, message) {
    if(action == 'softwareupdate') {
        var message = new gcm.Message({
            data: {
                "SOFTWARE_INSTALL": messagein
            }
        });
    }
    else if(action == 'deletedata') {
        var message = new gcm.Message({
            data: {
                "DELETE_DATA": messagein
            }
        });
    }
    else if(action == 'deletesharedpreferences') {
        var message = new gcm.Message({
            data: {
                "DELETE_SHP": messagein
            }
        });
    }
    else {
        var message = new gcm.Message({
            timeToLive: ttl,
            data: {
                "CLIENT_MESSAGE": action
            }
        });
    }

    var sender = new gcm.Sender('AIzaSyDegTDot6Ked4cbTLF_TpQH6ZP2zNqgQ0o');
    var regTokens = [obj.googleappid];

    sender.send(message, { registrationTokens: regTokens }, function (err, response) {
        if(err) {
            callback(false);
        }
        else 	{
            callback(true);
        }
    });
}

function save_messages(obj, messagein, ttl, action, callback){
    DBModel.bulkCreate([
        { username: 'barfooz', googleappid: 'googleappid', message: 'panslab', action: 'action', title: 'title' },
        { username: 'barfooz', googleappid: 'googleappid', message: 'panslab', action: 'action', title: 'title' },
        { username: 'barfooz', googleappid: 'googleappid', message: 'panslab', action: 'action', title: 'title' }
    ]).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail to create data'});
        } else {
            return res.status(200).send({message: 'Messages saved'});
        }
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
}

/**
 * Create
 */
exports.create = function(req, res) {
    var andcondition = {};
    var orcondition = [];

    andcondition.login_data_id = req.body.username;
    if(req.body.sendtoactivedevices) {
        andcondition.device_active = 1;
    }

    if(req.body.toios) {
        orcondition[0] = {};
        orcondition[0].appid  = 3;
    }
    if(req.body.toandroidsmartphone) {
        orcondition[1] = {};
        orcondition[1].appid  = 2;
    }
    if(req.body.toandroidbox) {
        orcondition[2] = {};
        orcondition[2].appid  = 1;
    }
    DBDevices.findAll(
        {
            where: {
                $and: andcondition,
                $or: orcondition
            },
            include: [{model: db.login_data, attributes: ['id'] ,required: true, where: {get_messages: true}}]
        }
    ).then(function(result) {
        if (!result) {
            return res.status(401).send({
                message: 'no records found'
            });
        } else {
            for(var key in result) {
                var obj = result[key];
                console.log("------------------------");
                console.log(obj)

                if(obj.appid == 1 ) {
                    sendandoirdnotification(obj,req.body.message,req.body.timetolive,req.body.message,function(result){});
                }
                if(obj.appid == 2 ) {
                    sendandoirdnotification(obj,req.body.message,req.body.timetolive,req.body.message,function(result){});
                }
                if(obj.appid == 3 ) {
                    sendiosnotification(obj,req.body.message,req.body.timetolive)
                }
            }
        }


    });


};


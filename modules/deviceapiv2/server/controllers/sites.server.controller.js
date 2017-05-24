'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
	crypto = require('crypto'),
	async = require('async'),
	nodemailer = require('nodemailer'),
	response = require(path.resolve("./config/responses.js")),
	authentication = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
	subscription = db.subscription,
    Combo = db.combo,
    login_data = db.login_data,
    SalesData = db.salesreport,
    dateFormat = require('dateformat'),
    customer_data = db.customer_data;

exports.createaccount = function(req,res) {

	var smtpConfig = {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // use SSL
		auth: {
			user: req.app.locals.settings.email_username,
			pass: req.app.locals.settings.email_password
		}
	};

	var smtpTransport = nodemailer.createTransport(smtpConfig);

	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = Buffer.from('tokensample').toString('hex');
				done(err, token);
			});
		},
		// check if username exists
		function(token,done) {
			login_data.findOne({
				where: {username: req.body.username.toLowerCase()}
			}).then(function (login_record) {
				if (login_record) {
					var myUserRes = response.REGISTRATION_ERROR;
					myUserRes.extra_data ='Username already exists';
					res.send(myUserRes);
					done(null, 1);
					return null;
				}
				else{
					done(null, token);
					return null;
				}
			}).catch(function (err) {
				//todo: return some response?
			});
		},
		// check if email exists
		function(token, done) {
			customer_data.findOne({
				where: {email: req.body.email.toLowerCase()}
			}).then(function (customer_record) {
				if (customer_record) {
					var myEmailRes=response.REGISTRATION_ERROR;
					myEmailRes.extra_data='Email already exists';
					res.send(myEmailRes);
					done(null, 1);
					return null;
				}
				else{
					done(null, token);
					return null;
				}
			}).catch(function (err) {
				//todo: return some response?
			});
		},
		//create account
		function(token, done) {
			if(token !== 1){
				var salt = authentication.makesalt();
				var password = authentication.encryptPassword(req.body.password, salt);

				customer_data.create({
					firstname:	req.body.firstname,
					lastname:	req.body.lastname,
					email:		req.body.email,
					telephone:	req.body.telephone
				}).then(function(new_customer){
					login_data.create({
						customer_id:			new_customer.id,
						username:				req.body.username,
						salt:                   salt,
						password:				password,
						channel_stream_source: 	1,
						vod_stream_source:		1,
						pin:					1234,
						show_adult:				0,
						auto_timezone:			1,
						player:					'default',
						activity_timeout:		900,
						get_messages:			0,
						force_upgrade:			0,
						account_lock:			0,
						resetPasswordToken:		token,
						resetPasswordExpires:   Date.now() + 3600000 // 1 hour
					}).then(function(new_login){
						done(null,token, new_customer);
						return null;
					}).catch(function(err){
						//todo: return some response?
					});
					return null;
				}).catch(function (err) {
					//todo: return some response?
				});
			}
			else{
				//todo: return some response?
			}
		},
		//todo: remove this part and it's template?
		function(token, new_customer, done) {
			res.render(path.resolve('modules/deviceapiv2/server/templates/new-account'), {
				name: new_customer.firstname + ' ' + new_customer.lastname,
				appName: req.app.locals.title, //todo: remains from old api???
				url: req.app.locals.originUrl + '/apiv2/sites/confirm-account/' + token

			}, function(err, emailHTML) {
				done(err, emailHTML, new_customer.email);
			});
		},
		function(emailHTML, email, done) {
			var mailOptions = {
				to: email, //user.email,
				from: 'NOREPLY_EMAIL', //replace with automatic reply email address
				subject: 'account confirmation email',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				var myEmail;
				if (!err) {
					myEmail=response.EMAIL_SENT;
					res.send(myEmail);

				} else {
					myEmail=response.EMAIL_NOT_SENT;
					res.send(myEmail);
				}
				done(err);
			});
		}
	],function(err) {
		if (err) {
			return err;
		}
	});
};

exports.confirmNewAccountToken = function(req, res) {
	login_data.find({
		where: {
			resetPasswordToken: req.params.token,
			resetPasswordExpires: {
				$gt: Date.now()
			}
		}
	}).then(function(user) {
		if (!user) {
			return res.send('invalid');
		}
		user.resetPasswordExpires = 0;
		user.account_lock = 0;
		user.save().then(function (result) {
            add_default_subscription(result.id);
			res.send('Account confirmed, you can now login');
		});
	});


    //Adds a default package
	function add_default_subscription(account_id){

        // Loading Combo with All its packages
        Combo.findOne({
            where: {
                id: 1
            }, include: [{model:db.combo_packages,include:[db.package]}]
        }).then(function(combo) {
            if (!combo)
                return res.status(404).send({message: 'No Product with that identifier has been found'});
            else {
                // Load Customer by LoginID
                login_data.findOne({
                    where: {
                        id: account_id
                    }, include: [{model:db.customer_data},{model:db.subscription}]
                }).then(function(loginData) {
                    if (!loginData) return res.status(404).send({message: 'No Login with that identifier has been found'});

                    // Subscription Processing
                    // For Each package in Combo
                    combo.combo_packages.forEach(function(item,i,arr){
                        var startDate = Date.now();

                        var sub = {
                            login_id: loginData.id,
                            package_id: item.package_id,
                            customer_username: loginData.username,
                            user_username: 'registration' //live
                        };

                        sub.start_date = Date.now();
                        sub.end_date =  addDays(Date.now(), combo.duration);

                        // Saving Subscription
                        subscription.create(sub).then(function(savedSub) {
                            if (!savedSub) return res.status(400).send({message: 'fail create data'});
                        })

                    });

                    // Insert Into SalesData
                    var sData = {
                        user_id: 1,
                        user_username: loginData.username,
                        login_data_id: loginData.id,
                        distributorname: 'admin',
                        saledate: new Date(),
                        combo_id: combo.id
                    };
                    SalesData.create(sData)
                        .then(function(salesData){
                            if (!salesData) return res.status(400).send({message: 'fail create sales data'});
                        });


                });
                return null;
            }
        });
	}


    function addDays(startdate_ts, duration) {
        var end_date_ts = startdate_ts + duration * 86400000; //add duration in number of seconds
        var end_date =  dateFormat(end_date_ts, "yyyy-mm-dd hh:MM:ss"); // convert enddate from timestamp to datetime
        return end_date;
    }

};

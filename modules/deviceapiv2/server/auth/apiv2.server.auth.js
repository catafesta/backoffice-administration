'use strict';

var CryptoJS = require("crypto-js"),
    crypto = require("crypto"),
    querystring = require("querystring"),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    models = db.models,
    response = require(path.resolve("./config/responses.js"));

var    keys = {
       password_key : "4fg65h4sdf6h6sdh", //todo: to be replaced with the password decryption method
};

function auth_encrytp(plainText, key) {
    var C = CryptoJS;
    plainText = C.enc.Utf8.parse(plainText);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createEncryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var encrypted = aes.finalize(plainText);
    return C.enc.Base64.stringify(encrypted);
}

function auth_decrypt(encryptedText, key) {
    var C = CryptoJS;
    encryptedText = encryptedText.replace(/(\r\n|\n|\r)/gm, "");
    encryptedText = C.enc.Base64.parse(encryptedText);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createDecryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var decrypted = aes.finalize(encryptedText);

    try {
        return C.enc.Utf8.stringify(decrypted);
    }
    catch(err) {
        return "error";
    }
}

function auth_veryfyhash(password,salt,hash) {
    var b = new Buffer(salt, 'base64');
    var iterations = 1000;
    var clength = 24;

    const key = crypto.pbkdf2Sync(password, b, iterations, clength, 'sha1');

    return hash == console.log(key.toString('base64'));
}

exports.getthisuserdetails = function(req,res,next) {
    models.login_data.findOne({
        where: {username: req.auth_obj.username}
    }).then(function (result) {
        if(result) {
            req.thisuser = result;
            next();
            return null;
            }
        else {
            res.send(response.USER_NOT_FOUND);
        }
    }).catch(function(error) {
        res.send(response.DATABASE_ERROR);
    });
};

exports.isAllowed = function(req, res, next) {
    var key_new = req.app.locals.settings.old_encryption_key;
    var key = req.app.locals.settings.new_encryption_key;

    if(req.body.auth){
        var auth = decodeURIComponent(req.body.auth);
    }
    else{
        var auth = decodeURIComponent(req.params.auth);
    }

    var auth_split = auth.split(';');

    //if array with more than 3 objects
    if(auth_split.length > 3) {
        var auth_obj = querystring.parse(auth,";","=");
    }
    else {
        var auth_obj = querystring.parse(auth_decrypt(auth,key),";","=");
    }

    if(Object.keys(auth_obj).length > 1) {
        if(auth_obj.appid == 1 || auth_obj.appid == 4 || auth_obj.appid == 5) auth_obj.screensize = 1
        else auth_obj.screensize = 2

    } else {
        return res.send(response.BAD_TOKEN);
    }


    //timestamp difference of 2 min allowed
    if((Math.abs(Date.now() - auth_obj.timestamp)) > 120000) {
        req.auth_obj = auth_obj;
        return(next());
    }
    else {
        req.auth_obj = auth_obj;
        return(next());
    }

 };
"use strict";

/**
 * Configuration file where you can store error codes for responses
 *
 * It's just a storage where you can define your custom API errors and their description.
 * You can call then in your action res.ok(data, sails.config.errors.USER_NOT_FOUND);
 */

module.exports = {

    OK: function() {
        this.status_code = 200;
        this.error_code = 1;
        this.timestamp = Date.now();
        this.error_description = 'OK';
        this.extra_data = '';
        this.response_object = [{}];
    },
    BAD_REQUEST: {
        "status_code": 701,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'E_BAD_REQUEST',
        "extra_data": 'The request cannot be fulfilled due to bad syntax',
        "response_object": [{}]
    },
    USER_NOT_FOUND: {
        "status_code": 702,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'USER_NOT_FOUND',
        "extra_data": 'User not found',
        "response_object": [{}]
    },
    ACCOUNT_LOCK: {
        "status_code": 703,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'ACCOUNT_LOCK',
        "extra_data": 'User account locked',
        "response_object": [{}]
    },
    WRONG_PASSWORD: {
        "status_code": 704,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'WRONG_PASSWORD',
        "extra_data": 'Password does not match',
        "response_object": [{}]
    },
    DUAL_LOGIN_ATTEMPT: {
        "status_code": 705,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'DUAL_LOGIN_ATTEMPT',
        "extra_data": 'Attempt to login on another device',
        "response_object": [{}]
    },
    DATABASE_ERROR: function() {
        this.status_code = 706;
        this.error_code = -1;
        this.timestamp = Date.now();
        this.error_description = 'DATABASE_ERROR';
        this.extra_data = 'Error connecting to database';
        this.response_object = [{}];
    },
    EMAIL_SENT: {
        "status_code": 200,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'EMAIL SENT',
        "extra_data": 'Email successfuly sent',
        "response_object": [{}]
    },
    EMAIL_NOT_SENT: {
        "status_code": 801,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'EMAIL ERROR',
        "extra_data": 'Error sending email',
        "response_object": [{}]
    },
    REGISTRATION_ERROR: {
        "status_code": 803,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'REGISTRATION_FAILED',
        "extra_data": '',
        "response_object": [{}]
    },
    BAD_TOKEN: {
        "status_code": 888,
        "error_code": -1,
        "timestamp": Date.now(),
        "error_description": 'BAD TOKEN',
        "extra_data": 'Token cannot be decrypted',
        "response_object": [{}]
    },
    CREATED: {
        code: 'CREATED',
        message: 'The request has been fulfilled and resulted in a new resource being created',
        status: 201
    },

    FORBIDDEN: {
        code: 'E_FORBIDDEN',
        message: 'User not authorized to perform the operation',
        status: 403
    },

    NOT_FOUND: {
        code: 'E_NOT_FOUND',
        message: 'The requested resource could not be found but may be available again in the future',
        status: 404
    },


    SERVER_ERROR: {
        code: 'E_INTERNAL_SERVER_ERROR',
        message: 'Something bad happened on the server',
        status: 500
    },

    UNAUTHORIZED: {
        code: 'E_UNAUTHORIZED',
        message: 'Missing or invalid authentication token',
        status: 401
    }

};

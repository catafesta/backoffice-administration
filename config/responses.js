"use strict";

/**
 * Configuration file where you can store error codes for responses
 *
 * It's just a storage where you can define your custom API errors and their description.
 * You can call then in your action res.ok(data, sails.config.errors.USER_NOT_FOUND);
 */

module.exports = {

    APPLICATION_RESPONSE: function(language, status_code, error_code, error_description, extra_data) {
        this.status_code = status_code;
        this.error_code = error_code;
        this.timestamp = Date.now();
        this.error_description = (languages[language]) ? languages[language].language_variables[error_description] : languages['eng'].language_variables[error_description];
        this.extra_data = (languages[language]) ? languages[language].language_variables[extra_data] : languages['eng'].language_variables[extra_data];
        this.response_object = [{}];
    },
    CREATED: function(language, error_description, extra_data){
        this.code = 'CREATED';
        this.message = 'The request has been fulfilled and resulted in a new resource being created';
        this.status = 201
    },

    FORBIDDEN: function(language, error_description, extra_data){
        this.code = 'E_FORBIDDEN';
        this.message = 'User not authorized to perform the operation';
        this.status = 403
    },

    NOT_FOUND: function(language, error_description, extra_data){
        this.code = 'E_NOT_FOUND';
        this.message = 'The requested resource could not be found but may be available again in the future';
        this.status = 404
    },


    SERVER_ERROR: function(language, error_description, extra_data){
        this.code = 'E_INTERNAL_SERVER_ERROR';
        this.message = 'Something bad happened on the server';
        this.status = 500
    },

    UNAUTHORIZED: function(language, error_description, extra_data){
        this.code = 'E_UNAUTHORIZED';
        this.message = 'Missing or invalid authentication token';
        this.status = 401
    }

};

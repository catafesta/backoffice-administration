'use strict';

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    acl = require('acl');

var jwt = require('jsonwebtoken'),
    jwtSecret = "thisIsMySecretPasscode",
    jwtIssuer = "mago-dev";

var systemroutes = require(path.resolve('./modules/mago/server/policies/systemroutes.json'));

/**
 * Module dependencies.
 */

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Mago Tables Permissions
 */
exports.invokeRolesPolicies = function() {
    acl.allow('admin', systemroutes, '*');
    acl.allow('guest', systemroutes, 'get')
};

/**
 * Check If Policy Allows
 */
exports.isAllowed = function(req, res, next) {

    var aHeader = req.get("Authorization");

    var token = null;
    if (typeof aHeader != 'undefined')
        token = aHeader;

    try {
        var decoded = jwt.verify(token, jwtSecret);
        req.token = decoded;
    } catch (err) {
        return res.status(403).json({
            message: 'User is not allowed'
        });
    }

    var roles = (req.token) ? req.token.role : ['guest'];

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
var debug = require('debug')('x-code:v1:policies'),

    UserSchema = require('../models/User'),

    config = rootRequire('config/global');

module.exports = function(req, res, next) {

    if (!config.jwtTokenVerificationEnable) { // skip user verification
        return next();
    }

    // if id not found
    if (!req.user || (req.user && !req.user._id)) {
        return res.status(401).json({ status: 0, message: "invalid user." }); // send unauthorized response
    }
    var reqToken = req.headers ? req.headers['access_token'] : '';
    // check into db user exists or not
    UserSchema
        .findOne({ _id: req.user._id, access_token: reqToken })
        .select({ password: 0 })
        .lean()
        .exec(function(err, user) {
            if (err) {
                debug("Error while getting login user details : ", err);
                return res.status(500).json({ status: 0, message: "Server error." }); // send server error
            }

            if (!user) { // if not found user for this id
                return res.status(401).json({ status: 0, message: "invalid user." }); // send unauthorized response
            }

            req.user = user; // store user in request parameter
            next();
        });

    // OR

    // next();
};

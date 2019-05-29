var debug = require('debug')('x-code:v1:policies'),
    jwt = require('jsonwebtoken'),
    config = rootRequire('config/global');

module.exports = function(req, res, next) {

    if (!config.jwtTokenVerificationEnable) { // skip token verification
        return next();
    }

    // Get token from headers
    var reqToken = req.headers ? req.headers['access_token'] : '';

    // verify a token symmetric
    jwt.verify(reqToken, config.secret, function(err, decoded) {
        // console.log('decode',decoded);
        if (err) {
            debug('ERROR: ' + err.message);

            //Send Unauthorized response
            res.status(401).json({ status: 0, message: err.message });
        } else if (decoded && decoded._id) { // user data
            // debug('DECODED:', decoded._doc);

            //Store user in request (user)
            req.user = decoded;

            next();
        } else {
            //Send Unauthorized response
            res.status(401).json({ status: 0, message: 'something wrong.' });
        }
    });
};

var debug = require('debug')('x-code:v1:socketRoutes'),
    SocketIO = rootRequire('support/socket.io'),
    UserController = require('../socketControllers/userSocketController.js');

var DecodeSocketRequestPolicy = require('../policies/decodeSocketRequest.js');

exports.init = function(app, apiBase) {

    SocketIO.on('io', function(io) {
        var nsp = io.of(apiBase + '/xcode');
        nsp.on('connection', function(socket) {
            debug('client connection established :->', socket.id);

            // to decode request parameters
            socket.use(DecodeSocketRequestPolicy);

            socket.emit('connected', 'You are connected.');

            // TEST
            socket.on('test', UserController.test.bind(null, socket, nsp));

            socket.on('disconnect', UserController.disconnect.bind(null, socket));

        });
    });

};

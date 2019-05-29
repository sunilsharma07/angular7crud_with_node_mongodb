var util = require('util');

var debug = require('debug')('x-code:v2:socket:socketControllers:userSocketController'),
    moment = require('moment'),
    async = require('async'),
    path = require('path'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    fse = require('fs-extra'),

    config = rootRequire('config/global'),
    Uploader = rootRequire('support/uploader'),
    Mailer = rootRequire('support/mailer'),
    DS = rootRequire('services/date'), // date services
    AESCrypt = rootRequire('services/aes');

var _self = {

    test: function(socket, nsp, data, CB) {
        CB({ "status": 1, "message": "got it", data: data });
    },

    disconnect: function(socket, data, CB) {
        debug('[SUCCESS] Client Disconnected:', socket.id, data);
    },

    encode: function(response) {
        try {
            if (response && typeof response.data != 'undefined') {
                response.data = JSON.stringify(response.data);
                response.data = AESCrypt.encrypt(response.data);
            } else {
                response.data = '';
            }
        } catch (e) {
            response = response;
        }

        return response;
    }

};

module.exports = _self;

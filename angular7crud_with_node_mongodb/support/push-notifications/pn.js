var util = require('util');

var debug = require('debug')('x-code:notification'),
    FCM = require('fcm-push'),
    apn = require('apn'),
    _ = require('underscore'),
    fs = require('fs'),

    config = rootRequire('config/global');

var _config = {
    "passphrase": "admin",
    'production': true,
    'key': fs.readFileSync(__dirname + '/pemFiles/cert.pem'),
    'cert': fs.readFileSync(__dirname + '/pemFiles/cert.pem'),
    'debug': true
};

var apnProvider = new apn.Provider(_config);

var _self = {

    /**
     * FCM Push Notification
     **/
    fcm: function pushFCM(options, callback) {
        // console.log('FCM :', options);

        var fcm = new FCM(config.notification.androidApiKey);
        var message = {
            to: options.to, // required fill with device token or topics
            data: options.data || {}
        };

        fcm.send(message, callback);
    },

    /**
     * APN Push Notification
     **/
    apn: function pushAPN(options, callback) {
        // console.log('APN :', options);

        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 0;
        note.sound = "default";
        note.alert = "xCode";
        note.topic = "com.app.xCode";
        note.contentAvailable = 1;

        // note.payload = {'messageFrom': 'John Appleseed'};
        note.payload = {
            body: {}
        };

        // assign clone of data to payload body
        if (options && options.data && options.data.message) {
            note.alert = options.data.message;
            note.payload.body = _.clone(options.data);

            delete note.payload.body['message'];
            delete note.payload.body['title'];
        }

        apnProvider.send(note, options.to).then((result) => {
            debug('\n result:', util.inspect(result, { showHidden: false, depth: null }));
            callback();
        });
    }
};

module.exports = _self;

// setTimeout(function() {
//     _self.apn({
//         to: 'B75BFCDFD7A8E946E330E4A4407FE351692C7A1595C748F5546934E3E91C6097',
//         data: {
//             message: 'test',
//             sender_id: 'sadsad'
//         }
//     });
// }, 2000);

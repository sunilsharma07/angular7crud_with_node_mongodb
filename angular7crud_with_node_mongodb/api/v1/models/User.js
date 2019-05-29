var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId,

    connection = require('../db/connection'),
    ED = rootRequire('services/encry_decry'),
    DS = rootRequire('services/date'); // date services

// model schema
var schema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    phone: {
      type: String,
      default: ''  
    },
    image:{
      type: String,
      default: ''  
    },
    access_token: {
      type: String,
       default: ''  
    },
    user_type:{
        type:String,
        default:''
    },
    forgotpassword_code:{
        type:String,
        default:''
    },
    status: {
        type: Number,
        default: 0
        /* 1 = active, 0 = inactive, 2= deleted*/
    },
    updated_at: {
        type: Date,
        default: DS.now()
    },
    created_at: {
        type: Date,
        default: DS.now()
    }
}, {
    collection: 'tbl_users'
});

schema.pre('save', function(next) {
    var user = this;
    if (!user.fbid) {
        user.password = ED.encrypt(user.password);
    }
    user.created_at = user.updated_at = DS.now();
    next();
});

schema.pre('update', function(next) {
    this.update({}, { $set: { updated_at: DS.now() } });
    next();
});

schema.methods.comparePassword = function(candidatePassword, cb) {
    var match = false;

    candidatePassword = ED.encrypt(candidatePassword);

    if (candidatePassword === this.password) {
        match = true;
    }
    cb(match);
};

module.exports = connection.model(schema.options.collection, schema);

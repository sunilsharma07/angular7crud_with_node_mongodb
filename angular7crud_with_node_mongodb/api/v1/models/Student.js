var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,

    connection = require('../db/connection'),
    ED = rootRequire('services/encry_decry'),
    DS = rootRequire('services/date'); // date services

// model schema
var schema = new Schema({
    coach_id: {
        type: Schema.Types.ObjectId,
        ref: 'tbl_users'
    },
    uniqueId: {
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
    email: {
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
    facebook_id:{
      type: String,
      default: ''  
    },
    device_id: {
      type: String,
      default: ''  
    },
    updated_at: {
       type: Date,
       default: DS.now()
    },
    created_at: {
       type: Date,
       default: DS.now()
    },
    status: {
        type: Number,
        default: 0
        /* 1 = active, 0 = inactive, 2= deleted*/
    },
}, {
    collection: 'tbl_students'
});

schema.pre('save', function(next) {
    var user = this;
    // if (!user.fbid) {
    //     user.password = ED.encrypt(user.password);
    // }
    user.created_at = user.updated_at = DS.now();
    next();
});

schema.pre('update', function(next) {
    this.update({}, { $set: { updated_at: DS.now() } });
    next();
});

module.exports = connection.model(schema.options.collection, schema);

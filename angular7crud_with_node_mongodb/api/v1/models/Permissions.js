var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId,
    moment = require('moment'),
    ED = rootRequire('services/encry_decry');

const schema = new Schema({
    key: {
        type: String,
        default: ''
    },
    value: {
        type: String,
        default: ''
    },
    routes: {
        type: Object,
        default: {
            "view": [],
            "api": []
        }
    },
    status: {
        type: Number,
        default: 1
        /* 1 = active, 2 = block*/
    },
    createdAt: {
        type: Date,
        default: moment().toISOString()
    },
    updatedAt: {
        type: Date,
        default: moment().toISOString()
    }
}, {
        collection: 'permissions'
    });

schema.pre('save', function (next) {
    this.updatedAt = moment().toISOString();
    this.createdAt = moment().toISOString();
    next();
});

schema.pre('update', function (next) {
    this.update({}, {
        $set: {
            updated_at: moment().toISOString()
        }
    });
    next();
});

module.exports = mongoose.model(schema.options.collection, schema);
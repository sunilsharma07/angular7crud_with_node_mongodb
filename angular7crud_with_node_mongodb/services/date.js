var moment = require('moment');

var _self = {
	now : function now() {
		return moment().toISOString();
	},

	getTime : function getTime() {
		return moment().valueOf();
	}
};

module.exports = _self;
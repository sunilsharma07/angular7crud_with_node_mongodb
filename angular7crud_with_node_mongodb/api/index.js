//Initalize all api versions
module.exports = function(app, apiBase) {

    /**
     * Initilize all api verions according to application release
     **/
    require('./v1')(app, apiBase + "/v1");

};

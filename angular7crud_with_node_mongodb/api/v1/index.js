//Initialize all routers
module.exports = function(app, apiBase) {

    /**
     * Socket APIs
     **/
    require('./socketRoutes/').init(app, apiBase);

    var auth = require('./routes/auth');
    app.use(apiBase, auth);

};

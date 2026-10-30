// Initializes the `change-password` service on path `/change-password`
const createService = require('./restore-session.class.js');
const hooks = require("./restore-session.hooks");

module.exports = function (app) {

    const paginate = app.get('paginate');

    const options = {
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/restore-session', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service("restore-session");

    service.hooks(hooks);
};

// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
const logger = require('winston');
// uncomment in order to log all request information
// const logger = require('../utils/logger');

// To see more detailed messages, uncomment the following line
// logger.level = 'debug';

// logger.log = function() {
//     var args = arguments;
//     var newArgs = {
//         foo: "bar",
//         baz: "abc"
//     };
//     console.log(arguments[2]);
// var originalMeta = args[2] || {};
// args[2].call(originalMeta, newArgs);

// logger.prototype.log.apply(this, args);
// };

module.exports = function () {
    return context => {
        // This debugs the service call and a stringified version of the hook context
        // You can customize the mssage (and logger) to your needs
        logger.debug(`${context.type} app.service('${context.path}').${context.method}()`);

        if (typeof context.toJSON === 'function') {
            let e = JSON.stringify(context, null, '  ');
            if (e.length > 5000)
                e = e.substring(0, 1200) + ' TRUNCATED';
            logger.debug('Hook Context', e);
        }

        if (context.error) {
            let e = JSON.stringify(context.error);
            if (e.length > 5000)
                e = e.substring(0, 1200) + ' TRUNCATED';
            logger.error(e);
        }
    };
};
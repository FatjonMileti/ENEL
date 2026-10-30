const { MethodNotAllowed, NotFound, BadRequest, GeneralError } = require('@feathersjs/errors');
const moment = require('moment');

let rateLimiter = {};

//INFO: The rate limiter is not exact. It works in memory and will not work as expected on multiple processes
module.exports = (intervalValue, intervalType, limit, waitValue, waitType) => async context => {
    let id;
    if (context.params.payload && context.params.payload.user.id) {
        id = context.params.payload.user.id;
    } else {
        id = context.params.payload.jti;
    }
    const endpoint = `${context.path}_${context.method}`;

    let now = moment();
    if (!rateLimiter[endpoint])
        rateLimiter[endpoint] = {};

    if (!rateLimiter[endpoint][id]) {
        rateLimiter[endpoint][id] = {
            blockedUntil: null,
            req: [moment(now)]
        };
        // console.log('pushed to ratelimiter', JSON.stringify(rateLimiter, null, 2));
    } else {
        let currentRateLimiter = rateLimiter[endpoint][id];
        let since = moment(now).add(-1 * intervalValue, intervalType);
        currentRateLimiter.req = currentRateLimiter.req.filter(x => x.isAfter(since));

        if (currentRateLimiter.blockedUntil && currentRateLimiter.blockedUntil.isAfter(now)) {
            // console.log('ACCESS DENIED UNTIL', currentRateLimiter.blockedUntil.format('HH:mm:ss'));
            currentRateLimiter.req.push(moment(now));
            // console.log('pushed to ratelimiter', JSON.stringify(rateLimiter, null, 2));
            throw new MethodNotAllowed('Too many attempts');
        }

        let previousRequests = currentRateLimiter.req.length;
        // console.log('previous requests', previousRequests);

        //should block
        if (previousRequests >= limit) {
            currentRateLimiter.blockedUntil = moment(now).add(waitValue || intervalValue, waitType || intervalType);
            // console.log('NEW BLOCK UNTIL', currentRateLimiter.blockedUntil.format('HH:mm:ss'));
            throw new MethodNotAllowed('Too many attempts');
        }
        else {
            currentRateLimiter.req.push(moment(now));
            currentRateLimiter.blockedUntil = null;
            // console.log('pushed to ratelimiter', JSON.stringify(rateLimiter, null, 2));
        }
    }
    return context;
};
const { parseJwt } = require('../utils/common.js');

module.exports = function (options = {}) {
    return function logger(req, res, next) {
        let user;
        let cid;
        if (res.req.headers.authorization) {
            // const jwt = parseJwt(res.req.headers.authorization);
            // user = `userId:${jwt.user.id}`;
            // cid = jwt.user.cid;
        } else {
            user = `userMarca:${res.req.body.marca}`;
            cid = res.req.headers.clientid;
        }
        res.on('finish', () => {
            const message = `# {"cid": "${cid}", "user": "${user}", "message": "${res.req.method} ${res.req.path} - ${res.statusCode} ${res.statusMessage}"}`;
            console.log(message);
        });
        next();
    };
};

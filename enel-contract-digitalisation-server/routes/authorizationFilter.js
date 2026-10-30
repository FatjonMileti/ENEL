const { authenticate } = require('@feathersjs/authentication').hooks;
const config =require("../src/constants/index")
module.exports = app => async(req, res, next) => {
    let authorized = false;
    if (req.headers.cookie) {
        let cookies = req.headers.cookie.split(';');
        for (const cookie of cookies) {
            const c = cookie.split('=');
            if (c[0].trim() === config.cookieName) {
                //validate token
                try {
                    let hook = await authenticate('jwt')({
                        app: app,
                        params: { provider: 'rest', headers: { authorization: `Bearer ${c[1]}` } },
                        type: 'before',
                        data: {}
                    });
                    res.locals.accessToken = c[1];
                    res.locals.user = hook.params.payload.user;
                    authorized = true;
                } catch (err) {
                    break;
                }
            }
        }
    }

    if (!authorized)
        return req.baseUrl.match('cms-v2') ? res.redirect('/cms-v2/login') : res.redirect('/cms/login');

    return next();
};
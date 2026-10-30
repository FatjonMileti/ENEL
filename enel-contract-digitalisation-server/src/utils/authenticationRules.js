const { hashToken, throwNotAuth } = require('./commonAuthentication');
const moment = require('moment');
const { USER_ROLE } = require('../utils/enums.js');

module.exports = async options => {
    const { app, req, payload } = options;
    const configAuth = app.get('authentication');
    const usersService = configAuth.local.service;
    const token = await hashToken(payload.jti);
    const passRules = app.get('passRules');
    let now = moment();

    let isTokenBlacklisted = await (async () => {
        let t = await app.service('tokens')
            .find({
                query: {
                    token: token
                }
            })
        return t.total > 0 ? true : false;
    })();

    const jwtToken = options.req.headers.authorization.split(" ")[1] ?? null;

    let isJwtTokenBlacklisted = await (async () => {
        let t = await app.service('token-blacklist')
            .find({
                query: {
                    token: jwtToken
                },
                $sort: {
                    id: -1
                }
            });
        return t.total > 0;
    })();


    if(isJwtTokenBlacklisted){
        return throwNotAuth('INVALID_JWT_TOKEN::Token is not valid anymore!');
    }


    const blacklistToken = async (slug) => {
        await app.service('tokens').create({ token: token });
        return throwNotAuth(slug, `Token is blacklisted because <${slug}>`);
    };

    if (isTokenBlacklisted) {
        return throwNotAuth('INVALID_TOKEN::Token is blacklisted!');
    }

    try {
        const userId = payload.user.id;
        const role = payload.user.role;
        if (role === USER_ROLE.USER) {
            let user = await app.service(usersService).find({
                query: {
                    id: userId,
                    $limit: 1
                }
            });
            if (user.total === 0) {
                await blacklistToken('INVALID_TOKEN::No user found!');
            }
            user = user.data[0];
            if (!user.isActive) {
                await blacklistToken('INVALID_TOKEN::User blocked!');
            }

            //if endpoint = change-password => skip
            const path = req.params.headers ? req.params.headers.path : null;
            const allowedPaths = ['change-password'].map(async path => await hashToken(path));
            if (path && allowedPaths.indexOf(path)) {
                return null;
            }

            let { createdAt, lastLogin } = user;
            createdAt = moment(createdAt);
            lastLogin = moment(lastLogin);
            const diff = moment.duration(lastLogin.diff(createdAt));
            const passwords = await app.service('passwords').find({
                query: {
                    userId: userId,
                    $limit: 1,
                    $sort: {
                        createdAt: -1
                    }
                }
            });
            if (passwords.total > 0) {
                const passLastDate = moment(passwords.data[0].createdAt);
                const diffPass = moment.duration(now.diff(passLastDate));
                if (diffPass.asDays() >= passRules.expiryDays) {
                    return throwNotAuth('CHANGE_PASSWORD::Parola Dvs. a expirat, va rugam sa va schimbati parola cu una noua.');
                }
                if (Math.round(passLastDate.valueOf()/1000) > payload.iat) {
                    await blacklistToken('INVALID_TOKEN::Parola a fost schimbata!');
                }
            } else if (diff.asDays() >= passRules.initialDaysToChange) {
                return throwNotAuth('CHANGE_PASSWORD::Parola Dvs. a expirat, va rugam sa va schimbati parola cu una noua.');
            }
            
        }
        return null;
    } catch (e) {
        throw e;
    }
};
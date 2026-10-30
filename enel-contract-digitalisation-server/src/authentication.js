const authentication = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { throwNotAuth } = require('./utils/commonAuthentication');
const { USER_TYPE, USER_ROLE } = require('./utils/enums.js');

const { sendSMS } = require('./utils/web2sms.js');
const Mailer = require('./utils/mailer');
const { request, generatePIN, isMobile } = require('./utils/common.js');

const requiresReCaptcha = (client) => {
    return [process.env.TELESALES_AGENT_APP].includes(client);
}

module.exports = function (app) {
    const config = app.get('authentication');
    const passRules = app.get('passRules');
    app.configure(authentication(config))
        .configure(local(config.local))
        .configure(local(config.client))
        .configure(jwt());

    const auth = () =>
        async (ctx) => {
            const clientsService = config.client.service;
            const usersService = config.local.service;
            let user, c, verify;
            const strategy = ctx.data && ctx.data.strategy;
            const now = moment();

            if (strategy === 'client') {
                if (!ctx.params ||
                    !ctx.params.headers ||
                    !ctx.params.headers['x-api-key'] ||
                    !ctx.params.headers[config.client.usernameField] ||
                    !ctx.params.headers[config.client.passwordField]) {
                    throwNotAuth('NO_PARAMS::No proper params in header!');
                }

                if (isMobile(ctx.params.headers.clientid) && !ctx.params.headers.version) {
                    throwNotAuth('USER_PIN::Nu puteti face login deoarece folositi o versiune veche a aplicatiei PPC Easy. Va rugam instalati ultima versiune.');
                }

                if (requiresReCaptcha(ctx.params.headers.clientid)) {
                    if (!ctx.data.code) {
                        throwNotAuth('RECAPTCHA::Missing recaptcha code.');
                    }

                    if (typeof ctx.data.ts === 'undefined') {
                        const captcha = JSON.parse(await request({
                            method: 'POST',
                            uri: 'https://www.google.com/recaptcha/api/siteverify',
                            body: {
                                secret: process.env.CAPTCHA_SECRET,
                                response: ctx.data.code
                            }
                        }));

                        if (!captcha.success) {
                            throwNotAuth('RECAPTCHA::Invalid recaptcha code.');
                        }
                    }
                }
            }

            const clientId = {
                key: config.client.usernameField,
                value: ctx.params.headers[config.client.usernameField]
            };
            const clientSecret = {
                key: config.client.passwordField,
                value: ctx.params.headers[config.client.passwordField]
            };
            const client = await app.service(clientsService).find({
                query: {
                    [clientId.key]: clientId.value,
                    $limit: 1
                }
            });

            if (client.total === 0) {
                throwNotAuth('NO_CLIENT::Client not found!');
            }

            if (!clientSecret.value) {
                throwNotAuth('NO_CLIENT_SECRET::Client secret not found!');
            }

            c = client.data[0];

            verify = await bcrypt.compare(clientSecret.value, c[clientSecret.key]);

            if (strategy === 'client') {
                //#region user pass fields
                if (!ctx.data ||
                    !ctx.data[config.local.usernameField] ||
                    !ctx.data[config.local.passwordField]) {
                    throwNotAuth('BODY::Invalid fields!');
                }

                const username = {
                    key: config.local.usernameField,
                    value: ctx.data[config.local.usernameField]
                };
                const password = {
                    key: config.local.passwordField,
                    value: ctx.data[config.local.passwordField]
                };

                if (!username.value || !password.value) {
                    throwNotAuth('WRONG_USER_PASS::Username-ul sau parola sunt incorecte.');
                }

                user = await app.service(usersService).find({
                    query: {
                        [username.key]: {
                            $iLike: username.value
                        },
                        $limit: 1
                    }
                });

                if (user.total === 0) {
                    throwNotAuth('WRONG_USER_PASS::Username-ul sau parola sunt incorecte.');
                }

                user = user.data[0];
                if (!user.isActive) {
                    throwNotAuth('USER_BLOCKED::Utilizatorul Dvs. este blocat, va rugam contactati administratorul aplicatiei.');
                }
                //#endregion

                //#region inactivity check
                let lastLogin = moment(user.lastLogin);
                const diff = moment.duration(now.diff(lastLogin));
                if (diff.asDays() >= passRules.maxDaysInactivityPeriod) {
                    await app.service(usersService).patch(user.id, { isActive: false });
                    throwNotAuth('USER_BLOCKED::Utilizatorul Dvs. este blocat, va rugam contactati administratorul aplicatiei.');
                }
                //#endregion

                //#region bad login
                if (user.maxPassReachDate) {
                    const minutesFromMaxPassReach = moment.duration(now.diff(moment(user.maxPassReachDate))).asMinutes();
                    const _dt = passRules.inactivityMinutes - minutesFromMaxPassReach;
                    if (minutesFromMaxPassReach <= passRules.inactivityMinutes) {
                        throwNotAuth(`USER_BLOCKED::Contul Dvs. a fot blocat temporar, va rugam reincercati dupa ${Math.ceil(_dt)} minute.`);
                    } else {
                        user = await ctx.app.service(usersService).patch(
                            user.id, {
                            failedLogins: 0,
                            maxPassReachDate: null
                        }
                        );
                    }
                }

                const verifyUsers = await bcrypt.compare(password.value, user[password.key]);
                if (!verifyUsers) {
                    user.failedLogins++;
                    let update = { failedLogins: user.failedLogins };
                    if (user.failedLogins >= passRules.maxOfAttempts) {
                        update.maxPassReachDate = (new Date()).toUTCString();
                    }
                    user = await ctx.app.service(usersService).patch(
                        user.id, update
                    );
                    if (update.maxPassReachDate) {
                        const minutesFromMaxPassReach = moment.duration(now.diff(moment(user.maxPassReachDate))).asMinutes();
                        const _dt = passRules.inactivityMinutes - minutesFromMaxPassReach;
                        throwNotAuth(`USER_BLOCKED::Contul Dvs. a fot blocat temporar, va rugam reincercati dupa ${Math.ceil(_dt)} minute.`);
                    } else {
                        throwNotAuth('WRONG_USER_PASS::Username-ul sau parola sunt incorecte.');
                    }
                }
                //#endregion

                verify = verify && verifyUsers && (c.userroles.indexOf(user.role) !== -1);

                //#region 2FA
                if (![USER_ROLE.ADMIN, USER_ROLE.CM, USER_ROLE.AGENT, USER_ROLE.LA, USER_ROLE.LMA, USER_ROLE.LSA, USER_ROLE.LRA, USER_ROLE.BUM].includes(user.role)) {
                    if (process.env.NODE_ENV !== 'development' && ctx.params.headers.clientid !== process.env.CMS) {
                        if (!user.pin || ctx.params.headers.rpin) {
                            const pin = generatePIN();
                            const sms = await sendSMS({ recipient: user.phone, message: pin });
                            if (sms) {
                                await ctx.app.service(usersService).patch(user.id, { pin: pin });
                                // This is here for the mobile application. Otherwise it will pass the auth without the PIN request.
                                throwNotAuth('USER_PIN::Va rog confirmati PIN-ul primit prin SMS!');
                            } else {
                                throwNotAuth('USER_PIN::Nu pot trimite SMS!', sms.message);
                            }
                        } else if (!ctx.data.pin || ctx.data.pin !== user.pin) {
                            user.failedLogins++;
                            let update = { failedLogins: user.failedLogins };
                            if (user.failedLogins >= passRules.maxOfAttempts) {
                                update.maxPassReachDate = (new Date()).toUTCString();
                            }
                            user = await ctx.app.service(usersService).patch(
                                user.id, update
                            );
                            if (update.maxPassReachDate) {
                                const minutesFromMaxPassReach = moment.duration(now.diff(moment(user.maxPassReachDate))).asMinutes();
                                const _dt = passRules.inactivityMinutes - minutesFromMaxPassReach;
                                throwNotAuth(`USER_BLOCKED::Contul Dvs. a fot blocat temporar, va rugam reincercati dupa ${Math.ceil(_dt)} minute.`);
                            } else {
                                throwNotAuth('USER_PIN::PIN-ul este incorect!');
                            }
                        }
                    }
                } else if (typeof ctx.data.ts !== 'undefined') {
                    if (!user.pin || ctx.params.headers.rpin) {
                        const pin = generatePIN();
                        const mess = `Codul pentru validarea identitatii tale este: ${pin}. Daca nu ai inregistrat o solicitare, te rugam sa ignori acest mesaj.`;

                        if (USER_TYPE.CALLCENTER === user.type && [USER_ROLE.AGENT, USER_ROLE.CM, USER_ROLE.LA, USER_ROLE.LMA, USER_ROLE.LSA, USER_ROLE.BUM].includes(user.role)) {
                            const mailer = new Mailer(ctx.app);
                            await mailer.sendMail(user.email, 'Activation', mess);
                            await ctx.app.service(usersService).patch(user.id, { pin: pin });

                            throwNotAuth('USER_PIN::Va rog confirmati PIN-ul primit pe mail!');
                        } else if (USER_TYPE.AGENT === user.type && [USER_ROLE.AGENT, USER_ROLE.CM, USER_ROLE.LA, USER_ROLE.LMA, USER_ROLE.LSA, USER_ROLE.BUM].includes(user.role)) {
                            const sms = await sendSMS({ recipient: user.phone, message: mess });

                            if (sms) {
                                await ctx.app.service(usersService).patch(user.id, { pin: pin });
                                throwNotAuth('USER_PIN::Va rog confirmati PIN-ul primit prin SMS!');
                            } else {
                                throwNotAuth('USER_PIN::Nu pot trimite SMS!', sms.message);
                            }
                        }
                    } else if (!ctx.data.pin || ctx.data.pin !== user.pin) {
                        user.failedLogins++;
                        let update = { failedLogins: user.failedLogins };
                        if (user.failedLogins >= passRules.maxOfAttempts) {
                            update.maxPassReachDate = (new Date()).toUTCString();
                        }
                        user = await ctx.app.service(usersService).patch(
                            user.id, update
                        );
                        if (update.maxPassReachDate) {
                            const minutesFromMaxPassReach = moment.duration(now.diff(moment(user.maxPassReachDate))).asMinutes();
                            const _dt = passRules.inactivityMinutes - minutesFromMaxPassReach;
                            throwNotAuth(`USER_BLOCKED::Contul Dvs. a fot blocat temporar, va rugam reincercati dupa ${Math.ceil(_dt)} minute.`);
                        } else {
                            throwNotAuth('USER_PIN::PIN-ul este incorect!');
                        }
                    }
                }
                //#endregion
            }

            if (!verify) {
                throwNotAuth('WRONG_USER_PASS::Username-ul sau parola sunt incorecte.');
            }

            if (user) {
                await ctx.app.service(usersService).patch(
                    user.id, {
                    failedLogins: 0,
                    pin: null
                }
                );
                await ctx.app.service('app-log').create(
                    {
                        sessionId: 1,
                        client: c.clientid,
                        type: 'AUTHENTICATION',
                        payload: {
                            user: user.marca,
                            cid: c.clientid,
                        }
                    }
                );
            }

            ctx.params.payload = ctx.params.payload || {};

            const partener = user ? user['canal.denumire'] : '';
            Object.assign(ctx.params.payload, {
                user: {
                    id: user ? user.id : 0,
                    role: user ? user.role : USER_ROLE.WEB,
                    type: user ? user.type : USER_TYPE.WEB,
                    employed: user ? user.employed : null, // ? 'Shop' : 'D2D',
                    cid: c.clientid,
                    username: user ? user.marca : '',
                    partenerName: partener,
                    companyId: user ? user.companyId : '',
                    fullname: user ? ((user.firstName ? user.firstName : '') + ' ' + (user.lastName ? user.lastName : '')) : '',
                }
            });

            ctx.params.user = user;
        };

    app.service('authentication').hooks({
        before: {
            all: [auth(), async ctx => {
                const p = ctx.params;
                if (p.headers.clientid !== process.env.WEB_APP && p.payload) {
                    if (p.payload.user && p.payload.user.id === 0) {
                        throwNotAuth('PAYLOAD_USER::No user data in token payload!');
                    }
                    const usersService = config.local.service;
                    const userId = p.payload.user.id;

                    const lastLogin = new Date().toUTCString();
                    if (ctx.params.user) {
                        ctx.params.user.lastLogin = lastLogin;
                    }
                    await ctx.app.service(usersService).patch(
                        userId, { lastLogin: lastLogin }
                    );
                }
            }],
            remove: [authentication.hooks.authenticate('jwt')]
        },
        after: {
            create: [async context => {
                const p = context.params;
                if (!p.user) {
                    return context;
                }

                let { createdAt, lastLogin } = p.user;
                createdAt = moment(createdAt);
                lastLogin = moment(lastLogin);
                const diff = moment.duration(lastLogin.diff(createdAt));
                const passwords = await app.service('passwords').find({
                    query: {
                        userId: p.user.id,
                        $limit: 1,
                        $sort: {
                            createdAt: -1
                        }
                    }
                });
                if (passwords.total > 0) {
                    const passLastDate = moment(passwords.data[0].createdAt);
                    const diffPass = moment.duration(moment().diff(passLastDate));
                    if (diffPass.asDays() >= passRules.expiryDays) {
                        context.result.changePassword = true;
                        context.result.message = 'Parola Dvs. a expirat, va rugam sa va schimbati parola cu una noua.';
                    }
                } else if (diff.asDays() >= passRules.initialDaysToChange) {
                    context.result.changePassword = true;
                    context.result.message = 'Parola Dvs. a expirat, va rugam sa va schimbati parola cu una noua.';
                }
                return context;
            }]
        }
    });
};

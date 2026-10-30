const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { populateUser, checkPermission } = require('../../hooks/session.js');
const { hasRestriction } = require('../../utils/permissions.js');

const { USER_ROLE } = require('../../utils/enums.js');
const { generatePassword, authorizeMe } = require('../../utils/common.js');
// const sms = require('../../utils/sms.js');
const { sendSMS } = require('../../utils/web2sms.js');
const Mailer = require('../../utils/mailer.js');

module.exports = {
    before: {
        all: [async context => {
            //if it's a REST call check if the user is allowed
            let hook = await authenticate('jwt')(context);
            if (hook.params.payload) {
                context = await populateUser(context);
                context = checkPermission('users.all')(context);
            } else //otherwise block external access
                return hooks.disallow('external')(context);
        }, async context => {
            const sequelize = context.app.get('sequelizeClient');
            const UserModel = sequelize.model('users');
            const CanalModel = sequelize.model('canal');
            context.params.sequelize = {
                include: [{
                    model: UserModel,
                    attributes: ['marca', 'firstName', 'lastName'],
                    as: 'manager'
                }, {
                    model: CanalModel,
                    as: 'canal'
                }]
            };
            return context;
        }],
        find: [async ctx => {
            // console.log('@@@ USER', ctx.params.user);
            if (ctx.params.user) {
                if (hasRestriction(ctx.params.user.role, 'users.companyId')) {
                    ctx.params.query = {
                        ...ctx.params.query,
                        companyId: ctx.params.user.companyId
                    }
                }
                if (ctx.params.user.role == USER_ROLE.LA) {
                    ctx.params.query = {
                        ...ctx.params.query,
                        role: { $in: [USER_ROLE.LMA, USER_ROLE.LSA, USER_ROLE.BUM, USER_ROLE.AGENT] }
                    }
                }
                if (ctx.params.user.role == USER_ROLE.LMA) {
                    ctx.params.query = {
                        ...ctx.params.query,
                        role: USER_ROLE.LSA
                    }
                }
                if (ctx.params.user.role == USER_ROLE.LSA) {
                    ctx.params.query = {
                        ...ctx.params.query,
                        role: USER_ROLE.BUM
                    }
                }
                if (ctx.params.user.role == USER_ROLE.BUM) {
                    ctx.params.query = {
                        ...ctx.params.query,
                        role: USER_ROLE.AGENT,
                        companyId: ctx.params.user.companyId
                    }
                }
            }
            // console.log('@@@ QUERY', ctx.params.query);
        }],
        get: [],
        create: [async ctx => {
            ctx.params.user && authorizeMe([USER_ROLE.ADMIN], ctx.params.user.role);
            const password = await generatePassword();
            ctx.data.rawPassword = password[0];
            ctx.data.password = password[1];
            ctx.data.marca = ctx.data.marca.toUpperCase();
        }],
        update: [async ctx => ctx.params.user && authorizeMe([USER_ROLE.ADMIN], ctx.params.user.role)],
        patch: [async ctx => ctx.params.user && authorizeMe([USER_ROLE.ADMIN], ctx.params.user.role)],
        remove: []
    },

    after: {
        all: [],
        find: [context => {
            //internal calls can access session secret
            if (context.params.provider) {
                context.result.data.map(item => {
                    delete item.password;
                    delete item.pin;
                });
            }
            return context;
        }],
        get: [context => {
            //internal calls can access session secret
            if (context.params.provider) {
                delete context.result.password;
                delete context.result.pin;
            }

            context.result.employed = context.result.employed === true ? "1" : "0";
            return context;
        }],
        create: [async ctx => {
            if (process.env.NODE_ENV !== 'development') {
                await sendSMS({
                    recipient: ctx.data.phone,
                    message: `Credentiale PPCEasy - Marca: ${ctx.data.marca.toUpperCase()} Parola: ${ctx.data.rawPassword}`,
                    subject: 'Credentials'
                });
                ctx.result = { success: true };
            } else if (ctx.data.email) {
                const mailer = new Mailer(ctx.app);
                await mailer.sendPlainMail(
                    ctx.data.email,
                    'PPCEasy - Credentials',
                    `Hi ${ctx.data.firstName}! \nPlease find bellow your login credentials:
                        username: ${ctx.data.marca}
                        password: ${ctx.data.rawPassword}`
                );
                ctx.result = { success: true };
            } else {
                ctx.result = { message: 'User don\'t have email address' };
            }
            return ctx;
        }],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};

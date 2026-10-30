const bcrypt = require('bcryptjs');
const { throwNotAuth, throwNotAcceptable } = require('../../utils/commonAuthentication');
/* eslint-disable no-unused-vars */

class RequestHandler {
    constructor(app, passRules) {
        this.score = 0;
        this.app = app;
        this.passRules = passRules;
    }

    scorePass(pass) {
        if (!pass) {
            return this.score;
        }

        const nonChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; //eslint-disable-line
        const rules = {
            length: pass.length >= this.passRules.minimumLength,
            digits: /\d/.test(pass),
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass),
            nonWords: nonChar.test(pass),
        };


        for (var rule in rules) {
            this.score += (rules[rule] === true) ? 1 : 0;
        }
    }
}

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async patch(id, data, params) {
        let req = new RequestHandler(this.app, this.passRules);

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        const userId = params.payload.user.id;
        const { password, newPassword, newPasswordDup } = data;

        const userPassword = await req.app.service('users').find({
            query: {
                id: userId,
                $select: ['password'],
                $limit: 1
            }
        });

        if (userPassword.total === 0) {
            throwNotAuth('CHANGE_PASSWORD::No user found!', 'Strange, the user was disappear...');
        }

        const passAreMatched = await bcrypt.compare(password, userPassword.data[0].password);
        if (!passAreMatched) {
            throwNotAuth('CHANGE_PASSWORD::Parola veche este gresita.', 'Wrong password!');
        }

        if (password === newPassword) {
            throwNotAcceptable('CHANGE_PASSWORD::Parola noua este identica cu una dintre parolele alese anterior. Va rugam introduceti alta parola.');
        }

        if (newPassword !== newPasswordDup) {
            throwNotAcceptable('CHANGE_PASSWORD::Parolele introduse nu coincid.');
        }

        req.scorePass(newPassword);
        if (req.score < req.passRules.minimumScore) {
            throwNotAcceptable(`CHANGE_PASSWORD::Complexitatea parolei este prea mica. Va rugam utilizati cel putin ${req.passRules.minimumLength} caractere, 1 majuscule, 1 cifre si 1 semne speciale`);
        }

        const userPasswords = await req.app.service('passwords').find({
            query: {
                userId: userId,
                $limit: req.passRules.latestPasswords,
                $sort: {
                    createdAt: -1
                }
            }
        });

        if (userPasswords.total > 0) {
            const passExists = userPasswords.data
                .filter(item => bcrypt.compareSync(newPassword, item.password));
            if (passExists.length) {
                throwNotAcceptable('CHANGE_PASSWORD::Parola noua este identica cu una dintre parolele alese anterior. Va rugam introduceti alta parola.');
            }
        }

        try {
            const salt = bcrypt.genSaltSync(12);
            await req.app.service('users').patch(userId, { password: bcrypt.hashSync(newPassword, salt) });
            await req.app.service('passwords').create({
                userId: userId,
                password: bcrypt.hashSync(password, salt)
            });
            return { success: true };
        } catch (e) {
            throw e;
        }
    }

    setup(app) {
        this.app = app;
        this.passRules = this.app.get('passRules');
    }

}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
/* eslint-disable no-unused-vars */

const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { generatePassword } = require('../../utils/common.js');
// const sms = require('../../utils/sms.js');
const { sendSMS } = require('../../utils/web2sms.js');
const Mailer = require('../../utils/mailer.js');
let moment = require('moment');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async get(id, params) {
        try {
            const userId = id;
            const password = await generatePassword();
            const now = moment();
            const user = await this.userService.patch(userId, { password: password[1], lastLogin: now });

            await this.app.service('passwords').create({
                userId: userId,
                password: password[1]
            });

            if (process.env.NODE_ENV !== 'development') {
                const smsSend = await sendSMS({
                    recipient: user.phone,
                    message: `Credentiale PPCEasy - Marca: ${user.marca.toUpperCase()} Parola: ${password[0]}`,
                    subject: 'Reset Password'
                });
                return { success: smsSend.status };
            } else if (user.email) {
                const mailer = new Mailer(this.app);
                const emailSend = await mailer.sendPlainMail(
                    user.email,
                    'PPCEasy - Your password has been reset',
                    `Hi ${user.firstName}! \nYour new credentials are:
                        username: ${user.marca}
                        password: ${password[0]}`
                );
                return { success: true }
            } else {
                return { success: false }
            }
        } catch (e) {
            console.log(e);
            return { success: false };
        }
    }

    async find(params) {
        const secret = process.env.SECRET_KEY;
        const { marca, email, phone, hash, userID, contactType } = params.query;

        // Call with hash and userID
        if (typeof hash !== 'undefined' && typeof userID !== 'undefined') {
            const password = await generatePassword();
            const now = moment();
            const currentHash = crypto.createHmac('sha256', secret).update(userID.toString()).digest('hex');

            if (hash !== currentHash) {
                throw new Error('Hash mismatch.');
            }

            const currentUser = await this.userService.patch(userID, { password: password[1], lastLogin: now });

            await this.app.service('passwords').create({
                userId: currentUser.id,
                password: password[1]
            });

            if (typeof contactType !== 'undefined' && contactType === 'email') {
                try {
                    const mailer = new Mailer(this.app);
                    await mailer.sendPlainMail(
                        currentUser.email,
                        'PPCEasy - Your password has been reset',
                        `Hi ${currentUser.firstName}! \nYour new credentials are:
                            username: ${currentUser.marca}
                            password: ${password[0]}`
                    );

                    return { success: true, status: 'OK' };
                } catch (err) {
                    console.log('>>>MAIL: ', err);
                }
            } else if (typeof contactType !== 'undefined' && contactType === 'phone') {
                try {
                    await sendSMS({
                        recipient: currentUser.phone,
                        message: `Credentiale PPCEasy - ${currentUser.marca.toUpperCase()} Parola: ${password[0]}`,
                        subject: 'Reset Password'
                    });

                    return { success: true, status: 'OK' };
                } catch (err) {
                    console.log('>>>SMS: ', err);
                }
            } else {
                throw new Error('Hash missmatch.');
            }
        }

        try {
            if (!phone && !email)
                throw new Error();
            if (typeof phone !== 'undefined' && phone.length < 3)
                throw new Error();
            let qryObj = { marca, phone: { [Op.like]: `%${phone}` } };

            if (typeof email !== 'undefined') {
                qryObj = { marca, email };
            }

            const user = await this.userService.Model.findOne({ where: qryObj });

            if (user === null) {
                throw new Error();
            }

            const computedHash = crypto.createHmac('sha256', secret).update(user.id.toString()).digest('hex');

            if (typeof email !== 'undefined') {
                try {
                    const mailer = new Mailer(this.app);
                    await mailer.sendPlainMail(
                        user.email,
                        'PPCEasy - Reset password',
                        `Hi ${user.firstName}! \nFollow this link to reset your password:
                            ${process.env.ABSOLUTE_URL}/landing/reset-password/${user.id}/email/${computedHash}`
                    );
                } catch (err) {
                    console.log('>>>MAIL: ', err);
                }
            } else if (typeof phone !== 'undefined') {
                try {
                    await sendSMS({
                        recipient: user.phone,
                        message: `Reset password PPCEasy - ${process.env.ABSOLUTE_URL}/landing/reset-password/${user.id}/phone/${computedHash}`,
                        subject: 'Reset Password'
                    });
                } catch (err) {
                    console.log('>>>SMS: ', err);
                }
            }

            return { success: true, status: 'OK' };
        } catch (err) {
            return { success: false, message: 'Datele introduse sunt incorecte.' };
        }
    }

    setup(app) {
        this.app = app;
        this.userService = this.app.service('users');
    }
}


module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;

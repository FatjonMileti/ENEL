require('dotenv').config();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const path = require('path');
const moment = require('moment');
const fileHelper = require('./file.helper.js');

const UPLOADS_PATH = path.join(path.resolve(__dirname), '../../uploads');

class Mailer {
    constructor(app) {
        this.app = app;
    }

    createTransport() {
        const transport = nodemailer.createTransport(smtpTransport({
            host: this.app.get('mailing').smtp,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: `${process.env.SMTP_USER_PASSWORD}`
            },
            tls: {
                rejectUnauthorized: false
            },
            port: process.env.SMTP_PORT ?? 2526
        }));

        return transport;
    }


    //new transport mail for offer
    createTransportOffer() {
        //TODO: remove hardcoded mailing service
        let transport;
        if (this.app.get('mailing').smtp === 'null' || !this.app.get('mailing').smtp) {
            transport = nodemailer.createTransport(smtpTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.MAIL_FROM_OFFER,
                    pass: `${process.env.MAIL_OFFER_PASS}`
                }
            }));
        } else {
            transport = nodemailer.createTransport(smtpTransport({
                host: this.app.get('mailing').smtp,
                port: process.env.SMTP_PORT ?? 2526,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: `${process.env.SMTP_USER_PASSWORD}`
                },
                tls: {
                    rejectUnauthorized: false
                },
            }));
        }

        return transport;
    }

    //new transport mail for offer

    async sendMail(to, subject, html, sessionId) {
        let transport = this.createTransport();
        const a = this.app.get('mailing').from;
        const self = this;
        return new Promise((resolve, reject) => {
            transport.sendMail({
                from: this.app.get('mailing').from,
                to: to,
                subject: subject,
                html: html
            }, function (err) {
                if (err) {
                    self.logEmail(to, err.toString(), html);
                    const trans = nodemailer.createTransport(smtpTransport({
                        host: process.env.SMTP_SERVER,
                        secure: false,
                        port: 25
                    }));
                    trans.sendMail({
                        from: process.env.MAIL_FROM,
                        to: to,
                        subject: subject,
                        html: html
                    }, function (err) {
                        if (err) {

                            return reject(err);
                        }

                        return resolve();
                    });
                    // return reject(err);
                }

                return resolve();
            });
        }).then(() => {
            if (sessionId) {
                return this.logEmail(to, subject, html, sessionId);
            } else {
                return true
            }
        });
    }

    async sendOfferMail(to, subject, html) {
        let transport = this.createTransportOffer();

        return new Promise((resolve, reject) => {
            transport.sendMail({
                from: process.env.MAIL_FROM_OFFER,
                to: to,
                subject: subject,
                html: html
            }, function (err) {
                if (err) {
                    const trans = nodemailer.createTransport(smtpTransport({
                        host: process.env.SMTP_SERVER,
                        secure: false,
                        port: 25
                    }));
                    trans.sendMail({
                        from: process.env.MAIL_FROM_OFFER,
                        to: to,
                        subject: subject,
                        html: html
                    }, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve();
                    });
                    // return reject(err);
                }

                return resolve();
            });
        }).then(() => {
            return true //this.logEmail(to, subject, html);
        });
    }

    async sendPlainMail(to, subject, text, sessionId) {
        let transport = this.createTransport();

        return new Promise((resolve, reject) => {
            transport.sendMail({
                from: this.app.get('mailing').from,
                to: to,
                subject: subject,
                text: text
            }, function (err) {
                if (err)
                    return reject(err);

                return resolve();
            });
        }).then(() => {
            return this.logEmail(to, subject, text, sessionId);
        });
    }

    async logEmail(to, subject, data, sessionId) {
        const LOGS_PATH = path.join(path.resolve(__dirname), '../../logs');
        const re = new RegExp(":", 'g');

        const fileName = `${UPLOADS_PATH}/${sessionId}/emails/${moment().format('YYYY-MM-DD HH:mm:ss').replace(re, '_')} - ${to} - ${subject}.txt`;

        if (sessionId) {
            await fileHelper.mkdir(`${UPLOADS_PATH}/${sessionId}`);
            await fileHelper.mkdir(`${UPLOADS_PATH}/${sessionId}/emails`);
            await fileHelper.writeFile(fileName, `
                FROM: ${this.app.get('mailing').from}
                TO: ${to}
                TIMESTAMP: ${moment().format('YYYY-MM-DD HH:mm:ss')}
                SUBJECT: ${subject}
                SESSION: ${sessionId}
                
                BODY:
                ${data}
            `);
        } else {
            try {
                await fileHelper.mkdir(`${LOGS_PATH}/emails`);
            } catch (err) {
                console.log('...............................CREATE SMSES FOLDER ERROR: ', err);
            }
            await fileHelper.writeFile(fileName, `
                FROM: ${this.app.get('mailing').from}
                TO: ${to}
                TIMESTAMP: ${moment().format('YYYY-MM-DD HH:mm:ss')}
                ERROR: ${subject}
                BODY:
                ${data}
            `);
        }
        return true;
    }
}

module.exports = Mailer;

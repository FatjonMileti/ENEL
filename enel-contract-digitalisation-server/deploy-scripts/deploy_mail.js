require('dotenv').config();
var Mailer = require('../src/utils/mailer.js');

var args = process.argv.slice(2);

(async () => {
    const mailer = new Mailer({
        get: () => {
            return {
                smtp: process.env.SMTP_SERVER,
                from: process.env.MAIL_FROM

            };
        }
    });
    await mailer.sendPlainMail(args[0], args[1], args[2]);
})();

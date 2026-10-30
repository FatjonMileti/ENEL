require('dotenv').config();
let moment = require('moment');
const scheduler = require('node-schedule');
let path = require('path');
let crypto = require('crypto');
let sequelize = require('sequelize');

const context = require('./data.js');
let fileHelper = require('../src/utils/file.helper.js');
const enums = require('../src/utils/enums.js');

let schema = process.env.PG_SCHEMA;
const sinceMonths = process.env.BACKOFFICE_CRON_SINCE_MONTHS;
const templatepath = path.join(path.resolve(__dirname), '../templates');
const templater = require('../src/utils/templater.js');
const Mailer = require('../src/utils/mailer.js');
const { sendSMS } = require('../src/utils/web2sms');
const Session = require('../src/models/session.model');
const app = require('../src/app');
const Op = sequelize.Op;

class Offer {
    constructor(id, type, session) {
        this.errors = null;
        this.type = type;
        this.id = id;
        this.session = session;
    }

    getField(field) {
        return this.session[`${this.type.toLowerCase()}_${field}`];
    }

    async sendClientMail(expireDate = moment()) {
        if (!this.getField('contact').email)
            return;

        console.log(`\t\t\tsendClientEmail() ${this.getField('contact').email}`);
        let file = await fileHelper.readFile(`${templatepath}/client-mail.html`);

        const secret = this.session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');

        let html = templater(file, {
            link: `${process.env.ABSOLUTE_URL}/landing/${computedHash}/${this.session.id}?type=${this.type}`,
            absoluteUrl: process.env.ABSOLUTE_URL,
            expireDate
        });

        const mailer = new Mailer({
            get: () => {
                return {
                    smtp: process.env.SMTP_SERVER,
                    from: process.env.MAIL_FROM
                };
            }
        });
        await mailer.sendMail(this.getField('contact').email, 'Contractul de furnizare este gata', html, this.session.id);

        return;
    }

    async sendClientSMS() {
        if (!this.getField('contact').telefon)
            return;

        console.log(`\t\t\tsendClientSMS() ${this.getField('contact').telefon}`);

        let file = await fileHelper.readFile(`${templatepath}/sms.txt`);

        const secret = this.session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');

        let sms = templater(file, {
            link: `${process.env.ABSOLUTE_URL}/landing/${computedHash}/${this.session.id}?type=${this.type}`
        });

        // await fileHelper.writeFile(`${process.env.SMS_PATH}/${this.getField('contact').telefon}_${+ new Date()}_SMS.CSV`, `"${sms}";"${this.getField('contact').telefon}"`);
        await sendSMS({ recipient: this.getField('contact').telefon, message: sms, subject: 'Reminder', sessionID: this.session.id });
    }
}


const processor = async () => {
    const started = moment();
    console.log(`REMINDER Processor Started ${started.toISOString()}`);
    const sessionModel = Session(app);
    const sessions = await sessionModel.findAll({
        where: {
            [Op.and]: [
                sequelize.literal(`DATE_PART('day', now()::timestamp - "createdAt"::timestamp) = 10`),
                // sequelize.where(sequelize.fn('DATE_PART', 'day', sequelize.col('ee_generated_documents')), '=', 0),
                {
                [Op.or]: [{
                    ee_offer_success: true,
                    ee_sign_success: true,
                    ee_activate_success: null
                },
                {
                    gaz_offer_success: true,
                    gaz_sign_success: true,
                    gaz_activate_success: null
                }
            ]
            }]
        },
        order: [['id', 'DESC']]
    });

    //     const query =
    //         `
    // select * from "${schema}".session
    // where
    // DATE_PART('day', now()::timestamp - "createdAt"::timestamp) = 10 and
    // (
    // 	(ee_offer_success=true and ee_sign_success=true and ee_activate_success is null) or
    // 	(gaz_offer_success=true and gaz_sign_success=true and gaz_activate_success is null)
    // )
    // order by id desc
    // `;
    // let sessions = await context.query(query, { type: sequelize.QueryTypes.SELECT });
    console.log(`Found ${sessions.length} sessions`);

    for (let session of sessions) {
        console.log(`\tSession ${session.id} of type ${session.type}`);
        let offers = [];
        let expireDate = moment();

        if (session.type === 'EE') {
            //const serviceUntilEE = session.ee_serviciu_pana_la || moment();
            const offerDateEE = session.ee_offer_date;
            //expireDate = moment.min(moment(serviceUntilEE), (moment(offerDateEE).add(120, 'h'))).format('DD.MM.YYYY - HH:mm');
            expireDate = moment(offerDateEE).add(120, 'h').format('DD.MM.YYYY - HH:mm');


            offers = [new Offer(session.ee_offer_internal_id, 'EE', session)];
        } else if (session.type === 'GAZ') {
            //const serviceUntillGaz = session.gaz_serviciu_pana_la || moment();
            const offerDateGaz = session.gaz_offer_date;
            //expireDate = moment.min(moment(serviceUntillGaz), (moment(offerDateGaz).add(120, 'h'))).format('DD.MM.YYYY - HH:mm');
            expireDate = moment(offerDateGaz).add(120, 'h').format('DD.MM.YYYY - HH:mm');

            offers = [new Offer(session.gaz_offer_internal_id, 'GAZ', session)];
        } else if (session.type === 'COMBO') {
            if (session.ee_offer_success && session.ee_generated_documents.length === 0) {
                offers = [new Offer(session.ee_offer_internal_id, 'EE', session)];
            }
            if (session.gaz_offer_success && session.gaz_generated_documents.length === 0) {
                offers.push(new Offer(session.gaz_offer_internal_id, 'GAZ', session));
            }
        }

        for (let offer of offers) {
            console.log(`\t\tofferId ${offer.id} type ${offer.type}`);

            //send email
            try {
                await offer.sendClientMail(expireDate);
            } catch (err) {
                console.log(`\t\t\t\tthrow sendClientEmail()`);
                console.log(`\t\t\t\t${JSON.stringify(err, null, 2)}`);
            }
            //send sms
            try {
                await offer.sendClientSMS();
            } catch (err) {
                console.log(`\t\t\t\tthrow sendClientSMS()`);
                console.log(`\t\t\t\t${JSON.stringify(err, null, 2)}`);
            }
        }
    }
}

console.log(`REMINDER processor pattern = ${process.env.REMINDER_CRON}`)
scheduler.scheduleJob(process.env.REMINDER_CRON, processor);

// (async () => await processor())();

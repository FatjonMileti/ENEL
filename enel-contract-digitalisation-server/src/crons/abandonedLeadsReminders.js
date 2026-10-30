require('dotenv').config();
const moment = require('moment');
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const {computeHash} = require('../hooks/session.js');
const fileHelper = require('../utils/file.helper.js');
const scheduler = require('node-schedule');
const app = require('../app');
const templater = require('../utils/templater.js');
const Mailer = require('../utils/mailer.js');
const Op = Sequelize.Op;
const path = require('path');
const SoapWrapper = require('../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

const LEAD_ABANDONED_24 = 'LEAD_ABANDONED_24';
const LEAD_ABANDONED_48 = 'LEAD_ABANDONED_48';


const getFilters = () => ({
    LEAD_ABANDONED_24: {
        [Op.and]: [
            {client_app: process.env.WEB_APP},
            {
                [Op.or]: [
                    {abandon_type: 'FC_ABANDON_BROWSER_INCHIS'},
                    {abandon_type: 'FC_ABANDON_INACTIVITATE_30MINS'}
                ]
            },
            {
                abandon_type_updated_at: {
                    [Op.and]: [
                        {
                            [Op.gte]: moment().subtract(2, 'days')
                        },
                        {
                            [Op.lt]: moment().subtract(1, 'days')
                        }]
                }
            },
            {ee_offer_success: null},
            {gaz_offer_success: null},
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${LEAD_ABANDONED_24}"}]')`)
                ]
            }
        ],
    },
    LEAD_ABANDONED_48: {
        [Op.and]: [
            {client_app: process.env.WEB_APP},
            {
                [Op.or]: [
                    {abandon_type: 'FC_ABANDON_BROWSER_INCHIS'},
                    {abandon_type: 'FC_ABANDON_INACTIVITATE_30MINS'}
                ]
            },
            {ee_offer_success: null},
            {gaz_offer_success: null},
            {
                abandon_type_updated_at: {
                    [Op.and]: [
                        {
                            [Op.gte]: moment().subtract(3, 'days')
                        },
                        {
                            [Op.lt]: moment().subtract(2, 'days')
                        }]
                }
            },
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${LEAD_ABANDONED_48}"}]')`)
                ]
            }
        ],
    },
});

const job = async () => {
    const sessionModel = Session(app);
    let emailsSent = 0;

    const FILTERS = getFilters();

    for (let reminder in FILTERS) {
        const filters = FILTERS[reminder];
        const sessions = await sessionModel.findAll({
            attributes: ['id', 'secret', 'generic_dossier_name', 'client', 'reminders'],
            where: [filters]
        });

        // console.log(`Found ${sessions.length} sessions.`);

        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            const contact = session.client;

            const computedHash = computeHash(session);

            try {
                if (contact.email) {

                    const emails = [
                        {
                            template: 'client-mail-lead-abandoned-one-day',
                            subject: `Mai ai 24 de ore să continui contractarea online cu numărul ${session.generic_dossier_name}!`,
                            reminderType: LEAD_ABANDONED_24,
                            reminderCode: "NOTIF_3"
                        },
                        {
                            template: 'client-mail-lead-abandoned-two-days',
                            subject: `Solicitarea ta cu numărul ${session.generic_dossier_name} va fi preluată de un partener PPC`,
                            reminderType: LEAD_ABANDONED_48,
                            reminderCode: "NOTIF_4"
                        }
                    ];

                    let email = emails.find(email => email.reminderType === reminder);
                    console.info(`Sending ${reminder} email reminder to session ${session.id} - ${contact.email}`);

                    let file = await fileHelper.readFile(`${path.join(path.resolve(__dirname), '../../templates/web')}/${email.template}.html`);

                    let html = templater(file, {
                        link: `${app.get('absoluteClientUrl')}/reia-procesul?id=${session.id}&hash=${computedHash}`,
                        dossier: session.generic_dossier_name,
                        absoluteUrl: global.absoluteUrl,
                        email: contact.email,
                        phone: contact.telefon_mobil,
                        name: contact.prenume,
                        lastname: contact.nume
                    });

                    const mailer = new Mailer(app);

                    try {
                        await mailer.sendMail(contact.email, email.subject, html);
                        emailsSent++;
                        const log = {reminder, timestamp: new Date()};
    
                        await sessionModel.update({
                            reminders: Array.isArray(session.reminders) ? [...session.reminders, log] : [log],
                        }, {where: {id: session.id}});
                    } catch (err) {
                        console.error('Error sending internal mail for new lead', err);
                    }
                }
                await soapMethods.wsLead({
                    step_id: "customerReminderInsertion",
                    reminder_code: email.reminderCode,
                    reminder_description: email.subject
                }, session.generic_dossier_id);

            } catch (error) {
                console.error(`Failed sending ${reminder} reminder for session ${session.id}:\n${error}`)
            }
        }
    }
    console.info(`Sent ${emailsSent} emails.`);
};

// job();

const run = async () => {
    try {
        console.info('Starting sending lead reminders');
        await job();
    } catch (err) {
        console.error(`Error sending lead reminders`, err);
    }
}

// scheduler.scheduleJob("*/5 * * * *", run); // every 1 minute for testing purposes
scheduler.scheduleJob("  0 30 */4 * * *", run); // every day at 7.00AM (+1h RO time)

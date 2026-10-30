require('dotenv').config();
const moment = require('moment');
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const {computeHash} = require('../hooks/session.js');
const reminder = require('../utils/reminder.js');
let sequelize = require('sequelize');
const path = require('path');
const scheduler = require('node-schedule');
const app = require('../app');
const { SESSION_STATUS } = require('../utils/enums.js');
const Op = Sequelize.Op;

const Reminder = new reminder(app, path.join(path.resolve(__dirname), '../../templates'));
const OFFER_EXPIRATION_HOURS = 120;
const getFilters = () => ({
    [Reminder.CLIENT_SIGNATURE_AGREE]: {
        [Op.and]: [
            {client_app: process.env.TELESALES_AGENT_APP},
            {link_sent_date: {[Op.lt]: moment().subtract(1, 'day')}},
            // { link_sent_date: { [Op.lt]: moment().subtract(5, 'minutes') } },
            {signature_agree_date: null},
            {is_fast_flow: false},
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.CLIENT_SIGNATURE_AGREE}"}]')`)
                ]
            },
        ],
    },
    [Reminder.CLIENT_UPLOAD_AGREE]: {
        [Op.and]: [
            {client_app: process.env.TELESALES_AGENT_APP},
            {signature_agree_date: {[Op.lt]: moment().subtract(1, 'day')}},
            // { signature_agree_date: { [Op.lt]: moment().subtract(5, 'minutes') } },
            {client_upload_agree_date: null},
            {ee_sign_date: null},
            {gaz_sign_date: null},
            {is_fast_flow: false},
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.CLIENT_UPLOAD_AGREE}"}]')`)
                ]
            },
        ],
    },
    [Reminder.CLIENT_DOCS_AGREE]: {
        [Op.and]: [
            {client_app: process.env.TELESALES_AGENT_APP},
            {ee_agree: null},
            {gaz_agree: null},
            {
                [Op.or]: [
                    {ee_sign_date: {[Op.lt]: moment().subtract(1, 'day')}},
                    {gaz_sign_date: {[Op.lt]: moment().subtract(1, 'day')}},
                    // { ee_sign_date: { [Op.lt]: moment().subtract(5, 'minutes') } },
                    // { gaz_sign_date: { [Op.lt]: moment().subtract(5, 'minutes') } },
                ]
            },
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.CLIENT_DOCS_AGREE}"}]')`)
                ]
            },
        ],
    },
    [Reminder.CLIENT_BEFORE_OFFER_EXPIRE]: {
        [Op.and]: [
            {client_app: process.env.TELESALES_AGENT_APP},
            {ee_agree: null},
            {gaz_agree: null},
            {
                status: { [Op.not]: SESSION_STATUS.OFFER_ERR }
            },
            {
                [Op.or]: [
                    {
                        ee_offer_date: {
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
                        gaz_offer_date: {
                            [Op.and]: [
                                {
                                    [Op.gte]: moment().subtract(3, 'days')
                                },
                                {
                                    [Op.lt]: moment().subtract(2, 'days')
                                }]
                        }
                    },
                    // { ee_serviciu_pana_la: { [Op.lt]: moment().add(10, 'minutes') } },
                    // { gaz_serviciu_pana_la: { [Op.lt]: moment().add(10, 'minutes') } },
                ]
            },
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.CLIENT_BEFORE_OFFER_EXPIRE}"}]')`)
                ]
            },
        ],
    },
    [Reminder.CLIENT_OFFER_EXPIRE]: {
        [Op.and]: [
            {client_app: process.env.TELESALES_AGENT_APP},
            {ee_agree: null},
            {gaz_agree: null},
            {
                [Op.or]: [
                    {
                        ee_offer_date: {
                            [Op.and]: [{
                                [Op.gte]: moment().subtract(6, 'days')
                            }, {
                                [Op.lt]: moment().subtract(5, 'days')
                            }]
                        }
                    },
                    {
                        gaz_offer_date: {
                            [Op.and]: [{
                                [Op.gte]: moment().subtract(6, 'days')
                            }, {
                                [Op.lt]: moment().subtract(5, 'days')
                            }]
                        }
                    },
                ]
            },
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.CLIENT_OFFER_EXPIRE}"}]')`)
                ]
            },
        ],
    },
    [Reminder.FC_CLIENT_BEFORE_OFFER_EXPIRE]: {
        [Op.and]: [
            {client_app: process.env.WEB_APP},
            {ee_agree: null},
            {gaz_agree: null},
            {
                [Op.or]: [
                    {
                        ee_offer_date: {
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
                        gaz_offer_date: {
                            [Op.and]: [
                                {
                                    [Op.gte]: moment().subtract(3, 'days')
                                },
                                {
                                    [Op.lt]: moment().subtract(2, 'days')
                                }]
                        }
                    },
                    // { ee_serviciu_pana_la: { [Op.lt]: moment().add(10, 'minutes') } },
                    // { gaz_serviciu_pana_la: { [Op.lt]: moment().add(10, 'minutes') } },
                ]
            },
            {
                status: { [Op.not]: SESSION_STATUS.OFFER_ERR }
            },
            {
                [Op.and]: [
                    sequelize.where(sequelize.fn('json_array_length', sequelize.col('ee_generated_documents')), '!=', 0)]
            },
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.FC_CLIENT_BEFORE_OFFER_EXPIRE}"}]')`)
                ]
            },
        ],
    },
    [Reminder.FC_CLIENT_OFFER_EXPIRE]: {
        [Op.and]: [
            {client_app: process.env.WEB_APP},
            {
                [Op.or]: [
                    {
                        [Op.and]: [
                            {ee_agree: null},
                            {gaz_agree: null}
                        ]
                    },
                    {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    {ee_agree: false},
                                    {gaz_agree: false}
                                ]
                            },
                            {
                                cron_rejection_date: {
                                    [Op.ne]: null
                                }
                            }
                        ]
                    }
                ]
            },
            {
                [Op.or]: [
                    {
                        ee_offer_date: {
                            [Op.and]: [{
                                [Op.gte]: moment().subtract(6, 'days')
                            }, {
                                [Op.lt]: moment().subtract(5, 'days')
                            }]
                        }
                    },
                    {
                        gaz_offer_date: {
                            [Op.and]: [{
                                [Op.gte]: moment().subtract(6, 'days')
                            }, {
                                [Op.lt]: moment().subtract(5, 'days')
                            }]
                        }
                    },
                ]
            },
            {
                [Op.or]: [
                    {reminders: null},
                    Sequelize.literal(`NOT ("session"."reminders" @> '[{"reminder":"${Reminder.FC_CLIENT_OFFER_EXPIRE}"}]')`)
                ]
            },
        ],
    },
});

const job = async () => {
    const sessionModel = Session(app);
    const sent = {email: 0, sms: 0};

    const FILTERS = getFilters();

    const rowForUpdate = [];
    for (let reminder in FILTERS) {
        const filters = FILTERS[reminder];
        const sessions = await sessionModel.findAll({
            attributes: ['id', 'secret', 'client',
            // 'client_app',
            'ee_offer_date', 'gaz_offer_date', 'ee_serviciu_pana_la', 'gaz_serviciu_pana_la', 'ee_contact', 'gaz_contact', 'reminders']
            ,
            where: [filters]
        });
        console.log(sessions.length);
        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            let contact = ''; //session.ee_contact || session.gaz_contact;
            const offerDate = session.ee_offer_date || session.gaz_offer_date;
            //const serviceUntil = session.ee_serviciu_pana_la || session.gaz_serviciu_pana_la;
            let link = '';

            if (session && session.ee_contact && (session.ee_contact.email || session.ee_contact.telefon))
                contact = session.ee_contact;
            else
                contact = session.gaz_contact;
            if (session.client_app === process.env.WEB_APP) {
                link = `${process.env.ABSOLUTE_URL}/${session.id}/${computeHash(session)}?type=EE`;
            } else {
                link = `${process.env.TELESALES_CLIENT_URL}/${session.id}/${computeHash(session)}`;
            }
            try {
                if (contact.email) {
                    console.info(`Sending ${reminder} email reminder to session ${session.id} - ${contact.email}`)
                    await Reminder.send(reminder, {
                        link,
                        absoluteUrl: process.env.ABSOLUTE_URL,
                        name: session.client ? [(session.client.prenume || ''), (session.client.nume || '')].join(' ') : '',
                        email: contact.email,
                        phone: contact.telefon,
                        //serviceUntil: serviceUntil ? moment(serviceUntil).format('DD.MM.YYYY') : '',
                        //expireDate: moment.min(moment(serviceUntil), (moment(offerDate).add(120, 'h'))).format('DD.MM.YYYY - HH:mm'),
                        expireDate: moment(offerDate).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm'),
                    }, 'email');
                    sent.email++;
                } else if (contact.telefon) {
                    console.info(`\nSending ${reminder} sms reminder to session ${session.id} - ${contact.telefon}`)
                    await Reminder.send(reminder, {
                        link,
                        phone: contact.telefon,
                        //serviceUntil: serviceUntil ? moment(serviceUntil).format('DD.MM.YYYY') : '',
                        //expireDate: moment.min(moment(serviceUntil), (moment(offerDate).add(120, 'h'))).format('DD.MM.YYYY - HH:mm'),
                        expireDate: moment(offerDate).add(OFFER_EXPIRATION_HOURS, 'h').format('DD.MM.YYYY - HH:mm'),
                    }, 'sms', '', session.id);
                    sent.sms++;
                }

                const log = {reminder, timestamp: new Date()}

                await sessionModel.update({
                    reminders: Array.isArray(session.reminders) ? [...session.reminders, log] : [log],
                }, {where: {id: session.id}});
            } catch (error) {
                console.error(`Failed sending ${reminder} reminder for session ${session.id}:\n${error}`)
            }
        }
    }
    console.info(`Sent ${sent.email} emails and ${sent.sms} SMS.`);
}
const run = async () => {
    try {
        console.info('Starting sending reporting reminders');
        await job();
    } catch (err) {
        console.error(`Error sending reporting reminders`, err);
    }
}

// run();

scheduler.scheduleJob("*/5 * * * *", run); // every 1 minute for testing purposes
// scheduler.scheduleJob("0 30 */4 * * *", run); // every day at 7.00AM (+1h RO time)

require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const Alert = require('../models/alerts.model');
const app = require('../app');
const Op = Sequelize.Op;
const Mailer = require('../utils/mailer.js');
const _ = require('lodash');
const moment = require('moment');

const DELAY = 60; // 60 minutes

const alertFilters = [
    {
        type: 'started',
        filters: {},
    },
    {
        type: 'activated',
        filters: {
            [Op.or]: [
                { [Op.and]: [{ type: 'EE' }, { ee_agree: true }] },
                { [Op.and]: [{ type: 'GAZ' }, { gaz_agree: true }] },
                { [Op.and]: [{ type: 'COMBO' }, { ee_agree: true }, { gaz_agree: true }] },
            ]
        }
    },
    {
        type: 'pending',
        filters: {
            [Op.or]: [
                { [Op.and]: [{ type: 'EE' }, { ee_agree: null }, { ee_sign_success: true }] },
                { [Op.and]: [{ type: 'GAZ' }, { gaz_agree: null }, { gaz_sign_success: true }] },
                { [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { gaz_agree: null }, { ee_sign_success: true }, { gaz_sign_success: true }] },
                { [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { gaz_agree: null }, { ee_sign_success: null }, { gaz_sign_success: true }] },
                { [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { gaz_agree: null }, { ee_sign_success: true }, { gaz_sign_success: null }] },
            ]
        }
    },
    {
        type: 'rejected',
        filters: {
            [Op.or]: [
                { ee_agree: false },
                { gaz_agree: false },
            ]
        }
    },
    {
        type: 'unfinished',
        filters: {
            [Op.or]: [
                { [Op.and]: [{ type: 'EE' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: null }] },
                { [Op.and]: [{ type: 'EE' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: true }] },
                { [Op.and]: [{ type: 'GAZ' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: null }] },
                { [Op.and]: [{ type: 'GAZ' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: true }] },
                {
                    [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: null },
                    { gaz_agree: null }, { gaz_sign_success: null }, { gaz_offer_success: null },]
                },
                {
                    [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: true },
                    { gaz_agree: null }, { gaz_sign_success: null }, { gaz_offer_success: null },]
                },
                {
                    [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: true },
                    { gaz_agree: null }, { gaz_sign_success: null }, { gaz_offer_success: null },]
                },
                {
                    [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: null },
                    { gaz_agree: null }, { gaz_sign_success: null }, { gaz_offer_success: true },]
                },
                {
                    [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { ee_sign_success: null }, { ee_offer_success: true },
                    { gaz_agree: null }, { gaz_sign_success: null }, { gaz_offer_success: true },]
                },
                { [Op.and]: { type: null }, },
            ]
        }
    },
    {
        type: 'errored',
        filters: {
            [Op.or]: [
                { [Op.and]: { ee_offer_success: false }, },
                { [Op.and]: { gaz_offer_success: false }, },
                { [Op.and]: { ee_sign_success: false }, },
                { [Op.and]: { gaz_sign_success: false }, },
                { [Op.and]: { ee_activate_success: false }, },
                { [Op.and]: { gaz_activate_success: false }, },
            ]
        }
    },
];

const typeLabels = {
    activated: 'Approved for activation',
    pending: 'Pending approval',
    rejected: 'Rejected by client',
    unfinished: 'Unfinished',
    errored: 'Cancelled or with error',
};

const getAlertsByEmail = (alerts) => {
    const byEmail = {};
    _.each(alerts, (alert) => {
        if (_.size(alert.emails)) {
            alert.emails.forEach((email) => {
                if (!byEmail[email]) {
                    byEmail[email] = [alert.type];
                } else {
                    byEmail[email].push(alert.type);
                }
            })
        }
    });

    _.each(byEmail, (message, email) => {
        byEmail[email] = _.uniq(byEmail[email]);
    });

    return byEmail;
}

const getMessagesByType = (sessions) => {
    const messages = {};

    _.each(sessions, (list, type) => {
        if (type === 'started') {
            messages[type] = `There are <b>${list.length} started processes</b> in the last hour.`;
        } else {
            messages[type] = {
                title: `<br/><br/><b>${typeLabels[type]}: ${list.length}</b><br/><br/>`,
                sessions: _.map(list, (session, key) => 
                    `<tr ${key % 2 == 0 ? 'style="background-color: #f2f2f2;"' : ''}><td>${session.id}</td>
                    <td>${session.prenume || '-'}</td>
                    <td>${session.nume || '-'}</td>
                    <td>${session.client.email || '-'}</td></tr>
                    `)
            }
        }
    })

    // format messages having a list of sessions
    _.each(messages, (message, type) => {
        const thead = '<tr><td>ID</td><td>First Name</td><td>Last Name</td><td>Email</td></tr>';
        if (type != 'started') {
            messages[type] = `${message.title}<table border="0" cellpadding="10" cellspacing="0">${thead}${message.sessions.join('')}</table>`
        }
    });

    return messages;
}

const buildMessages = (alerts, sessions) => {
    const alertsByEmail = getAlertsByEmail(alerts);
    const messagesByType = getMessagesByType(sessions);
    
    const messagesByEmail = {};
    
    _.each(alertsByEmail, (alerts, email) => {
        messagesByEmail[email] = messagesByType['started']
        + '<br/>' + _.map(alerts, alert => messagesByType[alert]).join('<br/>');
    });
    
    return messagesByEmail;
}

const sendEmail = async (email, message) => {
    const mailer = new Mailer(app);
    try {
        console.info(`Sending email to ${email}`);
        await mailer.sendMail(email, `Sessions report`, message);
    } catch (err) {
        console.error(`Error sending reporting email to ${email}`, err);
    }
}

const job = async () => {
    const alerts = await Alert(app).findAll();
    const sessions = {};

    for (let i = 0; i < alertFilters.length; i++) {
        const alert = alertFilters[i];
        sessions[alert.type] = await Session(app).findAll({
            where: [
                alert.filters,
                {
                    createdAt: { [Op.gt]: moment().subtract(DELAY, 'minutes') }
                }
            ],
        });
    }
    
    const messages = buildMessages(alerts, sessions);
    const emailPromises = [];

    for (email in messages) {
        emailPromises.push(
            sendEmail(email, messages[email])
        );
    }
    
    await Promise.all(emailPromises);
    console.info(`Successfully sent reporting emails to ${emailPromises.length}`);
}

const run = async () => {
    try {
        console.info('Starting sending reporting emails');
        await job();
    } catch (err) {
        console.error(`Error sending reporting emails`, err);
    } finally {
        process.exit();
    }
}

run();





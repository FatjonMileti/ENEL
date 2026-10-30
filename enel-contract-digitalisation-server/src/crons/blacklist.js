require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const AppLog = require('../models/app-log.model');
const Agent = require('../models/users.model');
const Company = require('../models/canal.model');
const app = require('../app');
const Op = Sequelize.Op;
const moment = require('moment');
const Mailer = require('../utils/mailer');
const _ = require('lodash');
const scheduler = require('node-schedule');
const USER_TYPE = require('../utils/enums');

const BLACKLIST_EMAILS = process.env.BLACKLIST_EMAILS || '';

const AGENT_TYPE_LABELS = {
        vi: 'AGENT',
        pe: 'OFFICER',
        web: 'WEB',
        ik: 'INFOKIOSK',
        cc: 'CALLCENTER',
    };


const emailRecipients = BLACKLIST_EMAILS.split(',');
const emailSubject = "Blacklist event reports";

const getChannelType = (user) => {
    let tip_canal = 2;
    if (user.type == USER_TYPE.CALLCENTER) {
        tip_canal = 4;
    } else if (user.type === USER_TYPE.OFFICER && (user.employed || user.role === USER_ROLE.AGENT)) {
        tip_canal = 3;
    } else if (user.type === USER_TYPE.INFOKIOSK && user.employed) {
        tip_canal = 5;
    } else if (user.type === USER_TYPE.WEB) {
        tip_canal = 6;
    }
    return tip_canal;
}

const getTableHead = () => {
    return  `<tr>
                <td>Session Id</td>
                <td>Created at</td>
                <td>Electricity Last Step</td>
                <td>Gas Last Step</td>
                <td>Agent</td>
                <td>Agent Marca</td>
                <td>Agent Company</td>
                <td>Commodity Type</td>
                <td>Channel Type</td>
                <td>Client email</td>
                <td>Client phone</td>
                <td>Contract email</td>
                <td>Contract phone</td>
                <td>Blacklisted value</td>
            </tr>`;
}

const getCommodity = (session) => {
    const { type } = session;
    if (type === "EE") return "Electricity";
    if (type.toUpperCase() === "GAZ") return "Gas";
    if (type === "COMBO") return "Electricity & Gas";
    return '-';
}

const getContractDetails = (session, data) => {
    const { ee_contact, gaz_contact } = session;
    if (ee_contact[data]) return ee_contact[data];
    if (gaz_contact[data]) return gaz_contact[data];
    return '-';
}

const getAgentName = (agent) => {
    const {lastName, firstName} = agent;

    if (lastName && firstName) return `${lastName} ${firstName}`;
    if (lastName && !firstName) return `${lastName}`;
    if (!lastName && firstName) return `${firstName}`;
    return '-';
}

const getEmailContent = async (blacklistItems) => {
    const firstStatement = `There have been <b>${blacklistItems.length}</b> sessions stopped due to a blacklisted phone or email.<br>`;
    const thead = getTableHead();
    let tcontents = [];

    for (let i = 0; i < blacklistItems.length; i++) {
        let item = blacklistItems[i].dataValues;

        const session = await Session(app).findOne({ where: { id: item.sessionId } });
        const agent = await Agent(app).findOne({ where: { id: item.payload.agent_id } });
        const company =  agent ? await Company(app).findOne({ where: { internal_id: agent.companyId } }) : null;

        tcontents[i] =
            `<tr ${i % 2 == 0 ? 'style="background-color: #f2f2f2;"' : ''}>
            <td>${item.sessionId || '-'}</td>
            <td>${session ? moment(session.createdAt).format("HH:mm DD.MM.YYYY") || '-' : '-'}</td>
            <td>${session ? session.ee_last_page || '-' : '-'}</td>
            <td>${session ? session.gaz_last_page || '-' : '-'}</td>
            <td>${agent ? getAgentName(agent) || '-' : '-'}</td>
            <td>${agent ? agent.marca || '-' : '-'}</td>
            <td>${company ? company.denumire || '-' : '-'}</td>
            <td>${session ? getCommodity(session) || '-' : '-'}</td>
            <td>${agent ? getChannelType(agent) : '-'}</td>
            <td>${session ? session.client.email || '-' : '-'}</td>
            <td>${session ? session.client.telefon_mobil || '-' : '-'}</td>
            <td>${session ? getContractDetails(session, 'email') : '-'}</td>
            <td>${session ? getContractDetails(session, 'telefon') : '-'}</td>
            <td>${item ? item.payload.value || '-' : '-'}</td>
            </tr>`;
    }

    return `${firstStatement}<table border="0" cellpadding="10" cellspacing="0">${thead}${tcontents.join('')}</table>`
}

const job = async () => {
    const blacklistItems = await AppLog(app).findAll({
        where: [{
            createdAt: { [Op.gte]: moment().subtract(1, 'days') },
            type: 'BLACKLIST',
        }],
    });
    const emailContent = await getEmailContent(blacklistItems);

    const mailer = new Mailer({
        get: () => {
            return {
                smtp: process.env.SMTP_SERVER,
                from: process.env.MAIL_FROM
            };
        }
    });

    emailRecipients.forEach(emailRecipient => {
        mailer.sendMail(
            emailRecipient,
            emailSubject,
            emailContent,
        );
    })
}

const run = async () => {
    try {
        console.info('Starting to send emails regarding sessions stopped because of blacklisted sessions & emails.');
        await job();
    } catch (err) {
        console.error(`Error - sending emails regarding sessions stopped because of blacklisted sessions & emails.`, err);
    }
}

scheduler.scheduleJob('0 30 6 * * *', run);

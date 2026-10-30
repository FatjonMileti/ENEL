require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const ActivateService = require('../services/activate/activate.class');
const app = require('../app');
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const scheduler = require('node-schedule');

const PENDING_FILTERS = {
    [Op.or]: [
        { [Op.and]: [{ type: 'EE' }, { ee_agree: null }, { ee_sign_success: true }] },
        { [Op.and]: [{ type: 'GAZ' }, { gaz_agree: null }, { gaz_sign_success: true }] },
        { [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { gaz_agree: null }, { ee_sign_success: true }, { gaz_sign_success: true }] },
        { [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { gaz_agree: null }, { ee_sign_success: null }, { gaz_sign_success: true }] },
        { [Op.and]: [{ type: 'COMBO' }, { ee_agree: null }, { gaz_agree: null }, { ee_sign_success: true }, { gaz_sign_success: null }] },
    ]
};

const job = async () => {
    const START_DATE = moment().add(1, 'day').subtract(1, 'month').startOf('month');
    const END_DATE = moment().add(1, 'day').subtract(1, 'month').endOf('month');

    console.info(`Start Date - ${START_DATE.format()}`);
    console.info(`Start Date - ${END_DATE.format()}`);

    const sessionModel = Session(app);
    const sessions = await sessionModel.findAll({
        attributes: ['id', 'type', 'agent_id', 'ee_offer_internal_id', 'gaz_offer_internal_id'],
        where: [
            PENDING_FILTERS,
            {
                [Op.or]: [
                    { [Op.and]: [{ ee_offer_date: { [Op.gt]: START_DATE } }, { ee_offer_date: { [Op.lt]: END_DATE } }] },
                    { [Op.and]: [{ gaz_offer_date: { [Op.gt]: START_DATE } }, { gaz_offer_date: { [Op.lt]: END_DATE } }] },
                ]
            },
        ],
    });

    const activateService = ActivateService();
    activateService.setup(app);

    
    const rejection_date_fun = async(id) => {
        await sessionModel.update({ cron_rejection_date: new Date() }, { where: { id: id } });
    };
    
    for (let i = 0; i < sessions.length; i++) {
        try {
            if (sessions[i].type == 'COMBO') {
                await activateService.remove(sessions[i].id, {
                    query: {
                        sessionId: sessions[i].id,
                        type: 'EE',
                    },
                    session: sessions[i],
                    disableHooks: true,
                });
                await activateService.remove(sessions[i].id, {
                    query: {
                        sessionId: sessions[i].id,
                        type: 'GAZ',
                    },
                    session: sessions[i],
                    disableHooks: true,
                });
            } else {
                await activateService.remove(sessions[i].id, {
                    query: {
                        sessionId: sessions[i].id,
                        type: sessions[i].type,
                    },
                    session: sessions[i],
                    disableHooks: true,
                });
            }
            rejection_date_fun(sessions[i].id);
            console.info(`Rejected ${sessions[i].id} offer`);
        } catch (err) {
            console.info(`Error rejecting ${sessions[i].id} offer`);
        }
        
    }
    
    console.info(`Successfully rejected ${sessions.length} offers`);
}


const run = async () => {
    try {
        console.info('Starting checking expired offers');
        await job();
    } catch (err) {
        console.error(`Error checking expired offers`, err);
    }
}
scheduler.scheduleJob("0 2 1 * *", run); // first day of month at 2:00 AM





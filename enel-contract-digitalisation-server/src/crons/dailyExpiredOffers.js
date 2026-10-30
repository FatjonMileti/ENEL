require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const ActivateService = require('../services/activate/activate.class');
const app = require('../app');
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const scheduler = require('node-schedule');
const OFFER_EXPIRATION_HOURS = 120;
const job = async () => {

    const START_DATE = moment().startOf('day').subtract(10, 'day');

    console.info(`Start date - ${START_DATE.format()}`);

    const sessionModel = Session(app);
    const sessions = await sessionModel.findAll({
        attributes: ['id', 'type', 'ee_serviciu_pana_la', 'gaz_serviciu_pana_la', 'ee_offer_date', 'gaz_offer_date', 'ee_offer_opportunity_id', 'gaz_offer_opportunity_id'],
        where: [
            {
                [Op.or]: [
                    { [Op.and]: [{ type: 'EE' }, { status: 'SIGN' }] },
                    { [Op.and]: [{ type: 'GAZ' }, { status: 'SIGN' }] },
                    { [Op.and]: [{ type: 'COMBO' }, { status: 'SIGN' }] },
                    { [Op.and]: [{ type: 'COMBO' }, { status: 'SIGN' }] },
                ]
            }, { createdAt: { [Op.gt]: START_DATE } }
        ],
    });

    const activateService = ActivateService();
    activateService.setup(app);

    const rejection_date_fun = async(id) => {
        await sessionModel.update({ cron_rejection_date: new Date() }, { where: { id: id } });
    };


    for (let i = 0; i < sessions.length; i++) {
        try {
            //let serviceUntil = null;
            let offerDate = null;
            if (sessions[i].type == 'COMBO') {
                //serviceUntil = sessions[i].ee_serviciu_pana_la || sessions[i].gaz_serviciu_pana_la;
                offerDate = sessions[i].ee_offer_date || sessions[i].gaz_offer_date;
                if (moment(offerDate).add(OFFER_EXPIRATION_HOURS, 'h') <= moment()) {
                    /* await activateService.remove(sessions[i].id, {
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
                    await sessionModel.update({ cron_rejection_date: new Date() }, { where: { id: sessions[i].id } });
                    console.info(`Rejected ${sessions[i].id} offer`);*/
                }
            }
            else {
                switch (sessions[i].type) {
                    case 'EE':
                        //serviceUntil = sessions[i].ee_serviciu_pana_la;
                        offerDate = sessions[i].ee_offer_date;
                        break;
                    case 'GAZ':
                        //serviceUntil = sessions[i].gaz_serviciu_pana_la;
                        offerDate = sessions[i].gaz_offer_date;
                        break;
                }

                if (offerDate) {
                    if (moment(offerDate).add(OFFER_EXPIRATION_HOURS, 'h') <= moment()) {
                        await activateService.remove(sessions[i].id, {
                            query: {
                                sessionId: sessions[i].id,
                                type: sessions[i].type,
                            },
                            session: sessions[i],
                            disableHooks: true,
                        });
                        rejection_date_fun(sessions[i].id);
                        console.info(`Rejected ${sessions[i].id} offer`);
                    }
                }
            }
        } catch (err) {
            console.info(`Error rejecting ${sessions[i].id} offer`);
        }
    }

}

//job(); //when run directly from console

const run = async () => {
    try {
        console.info('Starting checking daily expired offers');
        await job();
    } catch (err) {
        console.error(`Error checking daily expired offers`, err);
    }
}

//scheduler.scheduleJob("*/10 * * * *", run); // every 1 minutes
//scheduler.scheduleJob("0 0 3 * * *", run); // every day at 3.00AM (+1h RO time) 
scheduler.scheduleJob("0 */6 * * *", run);

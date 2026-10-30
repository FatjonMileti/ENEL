require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const ActivateService = require('../services/activate/activate.class');
const app = require('../app');
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const scheduler = require('node-schedule');

const job = async () => {

    const START_DATE = moment().startOf('day').subtract(2, 'day');

    console.info(`Start date - ${START_DATE.format()}`);

    const sessionModel = Session(app);
    const sessions = await sessionModel.findAll({
        attributes: ['id', 'type', 'ee_activate_date', 'gaz_activate_date', 'ee_serviciu_pana_la', 'gaz_serviciu_pana_la', 'ee_offer_date', 'gaz_offer_date', 'ee_offer_opportunity_id', 'gaz_offer_opportunity_id'],
        where: [
            {
                [Op.or]: [
                    { [Op.and]: [{ type: 'EE' }, {status: 'ACTIVATE_ERR'}] },
                    { [Op.and]: [{ type: 'GAZ' }, {status: 'ACTIVATE_ERR'}] },
                    { [Op.and]: [{ type: 'COMBO' }, {status: 'ACTIVATE_ERR'}] },
                    { [Op.and]: [{ type: 'COMBO' }, {status: 'ACTIVATE_ERR'}] },
                ]
            }, { ee_activate_date: { [Op.gt]: START_DATE } }
        ],
    });

    const activateService = ActivateService();
    activateService.setup(app);

    for (let i = 0; i < sessions.length; i++) {
        try {
            //let serviceUntil = null;
            let offerDate = null;
            if (sessions[i].type == 'COMBO') {
                //serviceUntil = sessions[i].ee_serviciu_pana_la || sessions[i].gaz_serviciu_pana_la;
                offerDate = sessions[i].ee_offer_date || sessions[i].gaz_offer_date;
            }
            else {
                switch (sessions[i].type) {
                    case 'EE':
                        //serviceUntil = sessions[i].ee_serviciu_pana_la;
                        offerDate = sessions[i].ee_offer_date;
                        if (offerDate) {
                            await activateService.create(sessions[i].id, {
                                query: {
                                    sessionId: sessions[i].id,
                                    type: sessions[i].type,
                                },
                                session: sessions[i],
                                disableHooks: true,
                            });
                            await sessionModel.update({ ee_active_date: new Date() }, { where: { id: sessions[i].id } });
                            console.info(`Activated ${sessions[i].id} offer`);
                    }
                        break;
                    case 'GAZ':
                        //serviceUntil = sessions[i].gaz_serviciu_pana_la;
                        offerDate = sessions[i].gaz_offer_date;
                        if (offerDate) {
                            await activateService.create(sessions[i].id, {
                                query: {
                                    sessionId: sessions[i].id,
                                    type: sessions[i].type,
                                },
                                session: sessions[i],
                                disableHooks: true,
                            });
                            await sessionModel.update({ gaz_active_date: new Date() }, { where: { id: sessions[i].id } });
                            console.info(`Activated ${sessions[i].id} offer`);
                    }
                        break;
                }

                
            }
        } catch (err) {
            console.info(`Error activating ${sessions[i].id} offer`);
        }
    }
}

job(); //when run directly from console

/*  const run = async () => {
    try {
        console.info('Starting checking daily expired offers');
        await job();
    } catch (err) {
        console.error(`Error checking daily expired offers`, err);
    }
}  */

//scheduler.scheduleJob("*/10 * * * *", run); // every 1 minutes
//scheduler.scheduleJob("0 0 3 * * *", run); // every day at 3.00AM (+1h RO time) 
//scheduler.scheduleJob("0 */6 * * *", run);

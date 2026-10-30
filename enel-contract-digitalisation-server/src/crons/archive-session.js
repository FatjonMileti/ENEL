
require('dotenv').config();
const scheduler = require("node-schedule");
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const SessionHistory = require('../models/session-history.model');
const app = require("../app");
const Op = Sequelize.Op;

let lock = false;
const run = async () => {
    if (lock) {
        console.log('session archiver already running => ' + new Date().toISOString())
        return;
    }
    // 🔒
    lock = true;
    const sessionModel = Session(app);
    const sessionHistoryModel = SessionHistory(app);

    console.log('session archiver stared => ' + new Date().toISOString())

    const rowCount = await sessionModel.count({
        where: {
            createdAt: {
                [Op.lt]: Sequelize.literal('CURRENT_DATE - INTERVAL \'90 days\''),
            },
        }
    });
    console.log('Row count:', rowCount);
    let offset = 0;
    let limit = 1;
    try {
        for (let i = 0; i < rowCount; i++) {
            console.log('Row:', i);
            const rowsToMove = await sessionModel.findAll({
                where: {
                    createdAt: {
                        [Op.lt]: Sequelize.literal('CURRENT_DATE - INTERVAL \'90 days\''),
                    },
                },
                offset,
                limit,
            });
            const rowsToMoveData = rowsToMove.map((el) => el.dataValues);
            try {
                await sessionHistoryModel.bulkCreate(rowsToMoveData);
            } catch (error) {
                if (error.name == 'SequelizeUniqueConstraintError') {
                    console.error('Row already exists in history table. Skipping...');
                } else {
                    throw error;
                }
            }

            offset += 1;
        }
        console.log('Rows moved successfully.');

        await sessionModel.destroy({
            where: {
                createdAt: {
                    [Op.lt]: Sequelize.literal('CURRENT_DATE - INTERVAL \'90 days\''),
                },
            }
        });
        console.log('Rows deleted successfully.');
    }
    catch (error) {
        console.error('Error moving rows:', error);
    }
    // 🔓
    lock = false;
    console.log('session archiver ended => ' + new Date().toISOString())
}

// run()
// every day at 4:30 AM
if (process.env.NODE_ENV !== 'production') {
    scheduler.scheduleJob('0 30 15 * * *', run);
} else {
    scheduler.scheduleJob('0 30 4 * * *', run);
}

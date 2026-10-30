require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('../models/session.model');
const app = require('../app');
const Op = Sequelize.Op;
const moment = require('moment');
const scheduler = require('node-schedule');
const rimraf = require('rimraf');
const path = require('path');
const uploadpath = path.join(path.resolve(__dirname), '../../uploads');

const job = async () => {
    console.log('started file cleanup job');

    const sessionModel = Session(app);
    const sessions = await sessionModel.findAll({
        attributes: ['id'],
        where: [{
            createdAt: { [Op.lt]: moment().subtract(90, 'day').startOf('day') }
        }, {
            createdAt: { [Op.gt]: moment().subtract(100, 'day').startOf('day') }
        }]
    });

    console.log(`found ${sessions.length} sessions`);
    console.log(`removing folders ${uploadpath}/{session.id}`);

    let i = 0;
    for (const session of sessions) {
        rimraf.sync(`${uploadpath}/${session.id}`);
        process.stdout.write(`removed session ${i} of ${sessions.length}\r`);
        i++;
    }

    console.log('ended file cleanup job');
}

scheduler.scheduleJob('0 0 1 * * *', job);
// job();

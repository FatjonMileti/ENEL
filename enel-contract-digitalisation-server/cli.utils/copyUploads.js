
require('dotenv').config();
let moment = require('moment');
const scheduler = require('node-schedule');
let path = require('path');
let sequelize = require('sequelize');
let fs = require('fs');
const { exec } = require('child_process');
const Session = require('../src/models/session.model');
const app = require('../src/app');
const Op = sequelize.Op;
const context = require('../reminder.processor/data.js');
let fileHelper = require('../src/utils/file.helper.js');
let schema = process.env.PG_SCHEMA;
const uploadpath = path.join(path.resolve(__dirname), '../uploads');
const tempPath = path.join(path.resolve(__dirname), '../tempuploads');

const query =
    `
select * from ${schema}.session
where
("createdAt" >='2020-05-20'::date and "createdAt" <'2020-06-04'::date) 
and ((ee_sign_success = true) or (gaz_sign_success = true)) 
and is_fast_flow = false
`;

const processor = async () => {
    const started = moment();
    console.log(`Processor Started ${started.toISOString()}`);
    try {
        fs.mkdirSync(`${tempPath}`);
    }
    catch (err) {
        console.log(`could not create ${tempPath}`);
    }
    const sessionModel = Session(app);
    // let sessions = await context.query(query, { type: sequelize.QueryTypes.SELECT });
    const sessions = await sessionModel.findAll({
        where: {
            [Op.and]: [
                {
                    createdAt: {
                        [Op.gte]: moment('2020-05-20', 'YYYY-MM-DD')
                    }
                },
                {
                    createdAt: {
                        [Op.lt]: moment('2020-06-04', 'YYYY-MM-DD')
                    }
                },
                {
                    [Op.or]: [
                        {ee_sign_success: true},
                        {gaz_sign_success: true}
                    ]
                },
                {
                    is_fast_flow: false
                }
            ]
        }

    });
    console.log(`Found ${sessions.length} sessions`);

    for (let session of sessions) {
        console.log(`\tSession ${session.id} of type ${session.type}`);
        exec(`cp -r ${uploadpath}/${session.id} ${tempPath}/${session.id}`, (error, stdout, stderr) => {
            console.log('copied');
        });
    }
}

(async () => await processor())();

const scheduler = require("node-schedule");
const {job} = require("./syncVariantePretService");

const run = async () => {
    try {
        console.info('Starting syncing variante-pret');
        await job();
    } catch (err) {
        console.error(`Error with syncing variante-pret`, err);
    }
}

if(process.env.NODE_ENV !== 'production') {
    // run();
    // scheduler.scheduleJob('*/240 * * * *', run);
    scheduler.scheduleJob('0 6,21 * * 1-5', run);
    // scheduler.scheduleJob(process.env.CRON_TIME, run);
} else {
    scheduler.scheduleJob('0 4 * * 1-5', run);
}


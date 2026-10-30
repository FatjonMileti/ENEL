require('dotenv').config();
const pdfHelper = require('../src/utils/pdf.helper');
let sequelize = require('sequelize');
const context = require('./data.js');
let schema = process.env.PG_SCHEMA;
const path = require('path');
const uploadpath = path.join(path.resolve(__dirname), '../uploads');
const fs = require('fs');
const Session = require('../src/models/session.model');
const app = require('../src/app');
const Op = sequelize.Op;

const readFile = (path, type) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, type, (err, data) => {
            if (err)
                return reject(err);

            return resolve(data);
        });
    });
};

const writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err, res) => {
            if (err)
                return reject(err);

            return resolve(res);
        });
    });
};

let csv = 'type\tid_fsd\tid_cros\tcnp\tvalid\terr\n';
(async () => {

    const sessionModel = Session(app);
    const sessions = await sessionModel.findAll({
        where: {
            [Op.or]: [
                {
                    ee_agree: true,
                },
                {
                    gaz_agree: true
                }
            ]
        }
    });


    const query = `select * from ${schema}.session where (ee_agree=true or gaz_agree=true)`;
    // let sessions = await context.query(query, { type: sequelize.QueryTypes.SELECT });
    console.log(`found ${sessions.length} sessions`);
    for (let session of sessions) {
        if (!session.client || !session.client.cnp) {
            console.error('no client cnp');
            continue;
        }
        let id = session.id;
        let id_cros;
        let cnp = session.client.cnp;
        let type = session.type;
        let documents = [];
        let valid = false;
        let buf;

        console.log(`session: ${id}, type: ${type}`);
        if (type === 'EE') {
            id_cros = session['ee_offer_internal_id'];
            documents = JSON.parse(JSON.stringify(session['ee_generated_documents']));

            try {
                buf = await readFile(`${uploadpath}/${id}/signed/${type}_Contract.pdf`);
            }
            catch (err) {
                console.error('file not found');
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\ttrue\tfile not found\n`;
                continue;
            }
            try {
                valid = await pdfHelper.findCNP(buf, cnp);
            } catch (err) {
                console.error(`findCNP failed\n${err}`);
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\tfalse\find cnp failed\n`
            }
            console.log(`valid: ${valid}`);

            csv += `${type}\t${id}\t${id_cros}\t${cnp}\t${valid}\n`;
        } else if (type === 'GAZ') {
            id_cros = session['gaz_offer_internal_id'];
            documents = JSON.parse(JSON.stringify(session['gaz_generated_documents']));

            try {
                buf = await readFile(`${uploadpath}/${id}/signed/${type}_Contract.pdf`);
            }
            catch (err) {
                console.error('file not found');
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\ttrue\tfile not found\n`;
                continue;
            }
            try {
                valid = await pdfHelper.findCNP(buf, cnp);
            } catch (err) {
                console.error(`findCNP failed\n${err}`);
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\tfalse\find cnp failed\n`
            }
            console.log(`valid: ${valid}`);

            csv += `${type}\t${id}\t${id_cros}\t${cnp}\t${valid}\n`;
        } else if (type === 'COMBO') {
            id_cros = session['ee_offer_internal_id'];
            documents = JSON.parse(JSON.stringify(session['ee_generated_documents']));

            try {
                buf = await readFile(`${uploadpath}/${id}/signed/EE_Contract.pdf`);
            }
            catch (err) {
                console.error('file not found');
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\ttrue\tfile not found\n`;
                continue;
            }
            try {
                valid = await pdfHelper.findCNP(buf, cnp);
            } catch (err) {
                console.error(`findCNP failed\n${err}`);
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\tfalse\find cnp failed\n`
            }
            console.log(`valid: ${valid}`);

            csv += `${type}\t${id}\t${id_cros}\t${cnp}\t${valid}\n`;

            //gaz
            id_cros = session['gaz_offer_internal_id'];
            documents = JSON.parse(JSON.stringify(session['gaz_generated_documents']));

            try {
                buf = await readFile(`${uploadpath}/${id}/signed/GAZ_Contract.pdf`);
            }
            catch (err) {
                console.error('file not found');
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\ttrue\tfile not found\n`;
                continue;
            }
            try {
                valid = await pdfHelper.findCNP(buf, cnp);
            } catch (err) {
                console.error(`findCNP failed\n${err}`);
                csv += `${type}\t${id}\t${id_cros}\t${cnp}\tfalse\find cnp failed\n`
            }
            console.log(`valid: ${valid}`);

            csv += `${type}\t${id}\t${id_cros}\t${cnp}\t${valid}\n`;
        }
    }
})().then(async () => {
    await writeFile('./incident.csv', csv);
    console.log('finished');
}).catch(err => {
    console.error(`crashed\n${err}`);
});
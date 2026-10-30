require('dotenv').config();
let moment = require('moment');
const scheduler = require('node-schedule');

let sequelize = require('sequelize');
const context = require('./data.js');
const { ERROR_TYPE, SESSION_STATUS } = require('../src/utils/enums.js');
let fileHelper = require('../src/utils/file.helper.js');
const soapConnector = require('../src/internal-services/soap/soap-connector.js');
const enums = require('../src/utils/enums.js');
let signatureMap = enums.signatureMap;
let agentSignatureMap = enums.agentSignatureMap;
const Session = require('../src/models/session.model');
const app = require('../src/app');
let schema = process.env.PG_SCHEMA;
const sinceMonths = process.env.BACKOFFICE_CRON_SINCE_MONTHS;
let path = require('path');
const uploadpath = path.join(path.resolve(__dirname), '../uploads');
const templatepath = path.join(path.resolve(__dirname), '../templates');
let crypto = require('crypto');
const templater = require('../src/utils/templater.js');
const pdfHelper = require('../src/utils/pdf.helper');
const Mailer = require('../src/utils/mailer.js');
const { sendSMS } = require('../src/utils/web2sms');
const { fail } = require('assert');

const Op = sequelize.Op;

class Offer {
    constructor(id, type, session) {
        this.errors = null;
        this.type = type;
        this.id = id;
        this.session = session;

        this.last_status = null;
    }

    getField(field) {
        return this.session[`${this.type.toLowerCase()}_${field}`];
    }

    async saveDocuments(documents) {
        let generated_documents = [];
        //folder structure
        await fileHelper.mkdir(`${uploadpath}/${this.session.id}`);
        await fileHelper.mkdir(`${uploadpath}/${this.session.id}/generated`);

        for (let document of documents) {
            if (document.doc) {
                let b64doc = document.doc;
                let name = document.nume_doc;
                let type = document.tip_doc;


                var buf = new Buffer(b64doc, 'base64');
                //check if session.cnp === doc.cnp
                if (type === 'CTR_ELEC' || type === 'CTR_GAZ') {
                    const foundCNP = await pdfHelper.findCNP(buf, this.session.contract_type === 'b2b' ? this.session.company.data.cui : this.session.client.cnp);
                    if (!foundCNP) {
                        throw ERROR_TYPE.CNP_MISMATCH;
                    }
                }

                let saveFilePath = `${uploadpath}/${this.session.id}/generated/${this.type}_${name}.pdf`;

                await fileHelper.writeFile(saveFilePath, buf);

                generated_documents.push({
                    name: `${name}.pdf`,
                    type: type,
                    signed: true
                });
            }
        }
        return generated_documents;
    }

    async sendClientMail() {
        if (!this.getField('contact').email)
            return;

        let file = await fileHelper.readFile(`${templatepath}/client-mail.html`);

        const secret = this.session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');

        let html = templater(file, {
            link: `${process.env.ABSOLUTE_URL}/landing/${computedHash}/${this.session.id}?type=${this.type}`,
            absoluteUrl: process.env.ABSOLUTE_URL
        });

        const mailer = new Mailer({
            get: () => {
                return {
                    smtp: process.env.SMTP_SERVER,
                    from: process.env.MAIL_FROM
                };
            }
        });
        await mailer.sendMail(this.getField('contact').email, 'Contractul de furnizare este gata', html, this.session.id);

        this.last_status = enums.PAGES.CONTRACTE_TRIMISE_EMAIL;

        return;
    }

    async sendClientSMS() {
        if (!this.getField('contact').telefon)
            return;

        let file = await fileHelper.readFile(`${templatepath}/sms.txt`);

        const secret = this.session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(this.session.id.toString()).digest('hex');

        let sms = templater(file, {
            link: `${process.env.ABSOLUTE_URL}/landing/${computedHash}/${this.session.id}?type=${this.type}`
        });

        // await fileHelper.writeFile(`${process.env.SMS_PATH}/${this.getField('contact').telefon}_${+ new Date()}_SMS.CSV`, `"${sms}";"${this.getField('contact').telefon}"`);
        await sendSMS({ recipient: this.getField('contact').telefon, message: sms, subject: 'Backoffice', sessionID: this.session.id });

        this.last_status = enums.PAGES.CONTRACTE_TRIMISE_SMS;
    }
}

const processor = async () => {
    const started = moment();
    console.log(`BACKOFFICE Processor Started ${started.toISOString()}`);
    const sessionModel = Session(app);
    // const query =
    //     `select * from "${schema}".session where status = 'OFFER_ERR'
    //      and "createdAt">='${moment().startOf('day').format('YYYYMMDD')}' and (
    //         (json_array_length(ee_generated_documents)=0 and "type" in ('EE', 'COMBO') and ((ee_sign_success = false) or (ee_sign_success is NULL))) or
    //        (json_array_length(gaz_generated_documents)=0  and "type" in ('GAZ', 'COMBO') and ((gaz_sign_success = false) or (gaz_sign_success is NULL))))
    //        order by id asc`;

    const sessions = await sessionModel.findAll({
        where: {
            status:'OFFER_ERR',
            createdAt: {
                $gte: `${moment().startOf('day').format('YYYYMMDD')}`
            },
            [Op.or]: [
                {
                    [Op.and]: [
                        sequelize.where(sequelize.fn('json_array_length', sequelize.col('ee_generated_documents')), '=', 0)
                        , {
                            $or: [{
                                ee_sign_success: false
                            }, { ee_sign_success: null }]
                        },
                        {
                            $or: [
                                { type: 'EE' },
                                { type: 'COMBO' }
                            ]
                        }]
                },
                {
                    [Op.and]: [
                        sequelize.where(sequelize.fn('json_array_length', sequelize.col('gaz_generated_documents')), '=', 0)
                        , {
                            [Op.or]: [{
                                gaz_sign_success: false
                            }, { gaz_sign_success: null }]
                        },
                        {
                            [Op.or]: [
                                { type: 'GAZ' },
                                { type: 'COMBO' }
                            ]
                        }]
                },

            ]
        }
    });


    // let sessions = await context.query(query, { type: sequelize.QueryTypes.SELECT });
    console.log(`Found ${sessions.length} sessions`);

    for (let session of sessions) {
        console.log(`\tSession ${session.id} of type ${session.type}`);

        let offers = [];

        if (session.type === 'EE') {
            offers = [new Offer(session.ee_offer_internal_id, 'EE', session)];

            /*             if (moment(session.ee_serviciu_pana_la) > moment()) {
                            await context.query(`update "${schema}".session set status='${SESSION_STATUS.OFFER_ERR}',
                                ${session.type.toLowerCase()}_offer_success=false where id=${session.id};`);
                            continue;
                        } */
        } else if (session.type === 'GAZ') {
            offers = [new Offer(session.gaz_offer_internal_id, 'GAZ', session)];

            /* if (moment(session.gaz_serviciu_pana_la) > moment()) {
                await context.query(`update "${schema}".session set status='${SESSION_STATUS.OFFER_ERR}',
                    ${session.type.toLowerCase()}_offer_success=false where id=${session.id};`);
                continue;
            } */
        } else if (session.type === 'COMBO') {
            let failed = false;

            if (session.ee_offer_success && session.ee_generated_documents.length === 0) {
                offers = [new Offer(session.ee_offer_internal_id, 'EE', session)];

                /*  if (moment(session.ee_serviciu_pana_la) > moment()) {
                     await context.query(`update "${schema}".session set status='${SESSION_STATUS.OFFER_ERR}',
                         ${session.type.toLowerCase()}_offer_success=false where id=${session.id};`);
                     failed = true;
                 } */
            }

            if (session.gaz_offer_success && session.gaz_generated_documents.length === 0) {
                offers.push(new Offer(session.gaz_offer_internal_id, 'GAZ', session));

                /*                 if (moment(session.gaz_serviciu_pana_la) > moment()) {
                                    await context.query(`update "${schema}".session set status='${SESSION_STATUS.OFFER_ERR}',
                                        ${session.type.toLowerCase()}_offer_success=false where id=${session.id};`);
                                    failed = true;
                                } */
            }

            if (failed) {
                continue;
            }
        }

        for (let offer of offers) {
            let documents = [];
            console.log(`\t\tofferId ${offer.id} type ${offer.type}`);

            let signatureDoc = offer.getField('documents').find(x => x.type === 'SEMNATURA_CLI');
            if (!signatureDoc) {
                console.log(`\t\t\tSession does not have a SEMNATURA_CLI file attached`);
                continue;
            }

            try {
                console.log(`\t\t\twsDocOut()`);
                documents = await soapConnector.wsDocOut(offer.id);
            }
            catch (err) {
                console.error('\t\t\toffer wsDocOut error', err);
                //update session
                await context.query(`update "${schema}".session set status='${SESSION_STATUS.OFFER_ERR}',
                        ${offer.type.toLowerCase()}_offer_success=false where id=${offer.session.id};`);
                continue;
            }
            console.log(`\t\t\treturned ${documents.length} documents`);
            let dbDocuments = await offer.saveDocuments(documents);

            //send email
            try {
                await offer.sendClientMail();
                console.log(`\t\t\tsendClientMail()`);
            } catch (err) {
                console.log(`\t\t\t\tthrow sendClientEmail()`);
                console.log(`\t\t\t\t${JSON.stringify(err, null, 2)}`);
            }
            //send sms
            try {
                await offer.sendClientSMS();
                console.log(`\t\t\tsendClientSMS()`);
            } catch (err) {
                console.log(`\t\t\t\tthrow sendClientSMS()`);
                console.log(`\t\t\t\t${JSON.stringify(err, null, 2)}`);
            }

            //update session
            try {
                let _q = `update "${schema}".session set status='${SESSION_STATUS.SIGN}',
                    ${offer.last_status ? `${offer.type.toLowerCase()}_last_page='${offer.last_status}',` : ``}
                    ${offer.type.toLowerCase()}_sign_success=true,
                    ${offer.type.toLowerCase()}_sign_date='${moment(started).format('YYYYMMDD')}',
                    ${offer.type.toLowerCase()}_generated_documents='${JSON.stringify(dbDocuments.map(x => {
                    return {
                        name: x.name,
                        type: x.type,
                        signed: x.signed
                    }
                }))}' where id=${offer.session.id};`;
                await context.query(_q);
            } catch (err) {
                console.log(`\t\t\t\tthrow db_update()`);
                console.log(`\t\t\t\t${JSON.stringify(err, null, 2)}`);
                continue;
            }
            console.log(`\t\t\tdb_update()`);

        }
    }
}

//console.log(`BACKOFFICE processor pattern = ${process.env.BACKOFFICE_CRON}`)
//scheduler.scheduleJob(process.env.BACKOFFICE_CRON, processor);

processor();

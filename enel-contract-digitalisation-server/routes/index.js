const fs = require('fs');
const crypto = require('crypto');
const moment = require('moment');
const fileHelper = require('../src/utils/file.helper.js');
const { filesize } = require('filesize');

const PPC_REDIRECT = 'https://www.ppcenergy.ro/pagina-confirmare/pagina-inexistenta';
const {USER_ROLE, USER_TYPE} = require('../src/utils/enums.js');

const enums = require('../src/utils/enums.js');
const pdfHelper = require('../src/utils/pdf.helper.js');
const {createDocsArchive, createArchive} = require('../src/utils/common.js');
const {BadRequest} = require("@feathersjs/errors");
const cors = require('cors');
const { corsOptions } = require('../src/utils/origins.js');


const validateHash = app => async (req, res, next) => {
    const {sessionid, userID, hash, contactType} = req.params;
    const type = req.query.type;
    let secret = '';
    let computedHash = '';

    req.locals = {valid: false};

    if (userID) {
        // check signature
        secret = process.env.SECRET_KEY;
        computedHash = crypto.createHmac('sha256', secret).update(userID).digest('hex');

        if (hash !== computedHash) {
            return res.redirect(PPC_REDIRECT);
        }

        try {
            await app.service('reset-password').find({query: {userID, hash, contactType}});
        } catch (err) {
            return res.redirect(PPC_REDIRECT);
        }
    } else {
        // check query parameters
        if (!type)
            return res.redirect(PPC_REDIRECT);
        if (['EE', 'GAZ'].indexOf(type) === -1)
            return res.redirect(PPC_REDIRECT);

        if (!sessionid || !hash) {
            return res.redirect(PPC_REDIRECT);
        }

        // get session
        let db_sessions;
        try {
            db_sessions = (await app.service('session').find({query: {id: sessionid}})).data;
        } catch (err) {
            return res.redirect(PPC_REDIRECT);
        }

        if (db_sessions && db_sessions.length > 0) {
            let db_session = db_sessions[0];

            if (!db_session.client || (db_session.contract_type === 'b2c' && !db_session.client.cnp) || (db_session.contract_type === 'b2b' && (!db_session.company.data || !db_session.company.data.cui)))
                return res.redirect(PPC_REDIRECT);

            //check if session has apropriate state
            //successful offer and successful sign
            if (!db_session[`${type.toLowerCase()}_sign_success`])
                return res.redirect(PPC_REDIRECT);

            //user canceled
            if (db_session[`${type.toLowerCase()}_agree`] === false)
                return res.redirect(PPC_REDIRECT);

            //check if offer expired
            const duration = moment.duration(moment().diff(moment(db_session.createdAt))).asDays();
            if (duration > app.get('offerExpiresInDays'))
                return res.redirect(PPC_REDIRECT);
            // return res.redirect('expired.hbs', { absoluteUrl: global.absoluteUrl });

            if (db_session[`${type.toLowerCase()}_agree`] === null) {
                const duration = moment.duration(moment().diff(moment(db_session.createdAt))).asDays();
                if (duration >= 15)
                    return res.redirect(PPC_REDIRECT);
            }
            // check signature
            secret = db_session.secret;
            computedHash = crypto.createHmac('sha256', secret).update(sessionid).digest('hex');

            if (hash !== computedHash)
                return res.redirect(PPC_REDIRECT);

            req.locals.session = db_session;
            req.locals.valid = true;
            req.locals.type = type;
            req.locals.hash = hash;
            req.locals.agreed = db_session[`${type.toLowerCase()}_agree`];
        }
    }

    return next();
};

const validateHashOffer = app => async (req, res, next) => {
    const {offer, hash} = req.params;
    const type = req.query.type;
    let secret = '';
    let computedHash = '';

    // check signature
    secret = process.env.OFFER_SECRET;
    computedHash = crypto.createHmac('sha256', secret).update(offer).digest('hex');

    if (hash !== computedHash)
        return res.redirect(PPC_REDIRECT);

    // req.locals.session = db_session;
    // req.locals.valid = true;
    // req.locals.type = type;
    // req.locals.hash = hash;
    // req.locals.agreed = db_session[`${type.toLowerCase()}_agree`];


    return next();
};

const validateDocAccess = app => async (req, res, next) => {
    const {sessionid, hash} = req.params;
    const type = req.query.type;

    req.locals = {
        valid: false
    };
    try {

        if (!sessionid || !hash) {
            throw new BadRequest("No session id provided");
        }

        if (sessionid === 'undefined' || hash === 'undefined') {
            throw new BadRequest("Invalid session id or hash");
        }

        // check query parameters
        if (!type)
            return res.redirect(PPC_REDIRECT);
        if (['EE', 'GAZ'].indexOf(type) === -1)
            return res.redirect(PPC_REDIRECT);

        if (!sessionid || !hash) {
            return res.redirect(PPC_REDIRECT);
        }

        // get session
        let db_sessions;
        try {
            db_sessions = (await app.service('session').find({query: {id: sessionid}})).data;
        } catch (err) {
            return res.redirect(PPC_REDIRECT);
        }

        if (db_sessions && db_sessions.length > 0) {
            let db_session = db_sessions[0];

            // check signature
            const secret = db_session.secret;
            const computedHash = crypto.createHmac('sha256', secret).update(sessionid).digest('hex');

            if (hash !== computedHash)
                return res.redirect(PPC_REDIRECT);

            req.locals.session = db_session;
            req.locals.valid = true;
            req.locals.type = type;
            req.locals.hash = hash;
            req.locals.agreed = db_session[`${type.toLowerCase()}_agree`];
        }

        return next();
    } catch (error){
        return next(error)
    }
}

const PAGE_INFO = {
    pageType: 'n.a.',
    pageName: 'n.a.',
    level1: 'n.a.',
    level2: 'n.a.',
    level3: 'n.a.',
    provider: 'n.a.', // ppc sa || ppc muntenia sa"
    server: 'public area',
    language: 'ro', // change it if we are using multilanguages
    country: 'ro', // ro
};

const generateStepAdobeAnalyticsStep12a = session => {
    const serviciu = session.ee_serviciu || session.gaz_serviciu;
    const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

    const offer = {
        offerCategory: serviciu.cod,
        offerName: serviciu.denumire,
        offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
        offerUsage: serviciu?.seg?.toLowerCase() === 'residential' ? 'residential' : 'business', // business or residential
        offerCounty: session.judet, //
        annualConsumption,
    };
    const eventType = 'subscriptionFormStep12a';
    const pageInfo = { ...PAGE_INFO };
    pageInfo.pageType = 'subscription form';
    
    pageInfo.level1 = 'subscription form';
    pageInfo.level2 = 'stipulated contract';

    let provider = '';
    if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
        provider = 'PPC muntenia sa';
    } else {
        provider = 'PPC energie sa';
    }
    pageInfo.provider = provider;
    const sessionId = session.id;
    const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
    const existedClient = session.backoffice ? 'no' : 'yes';
    const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
    const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
    const invoice = session.ee_factura || gaz_factura;
    const contact = session.ee_contact || gaz_contact;
    const waySendingBill = invoice ? (invoice.mod_corespondenta == 'POSTA' ? 'at home' : (invoice.mod_corespondenta == 'MAIL' ? 'email' : 'sms')) : '';
    // const sendingVia = contact ? (contact.contract_sent_by == 'SMS' ? 'sms' : (contact.contract_sent_by == 'EMAIL' ? 'email' : '')) : '';
    const activate_success = session.ee_activate_success || session.gaz_activate_success;
    pageInfo.level3 = activate_success !== null ? ':via email' : '';
    pageInfo.pageName = 'subscription form:stipulated contract'+pageInfo.level3;
    const offerInfo = [offer];
    const event = {
        event: eventType,
        subscriptionInfo: {
            activeSupply: subscriptionChoice,
            processID: sessionId,
            currentProvider,
            currentHolder,
            existedClient,
            waySendingBill,
        },
        pageInfo,
        offerInfo,

    };
                    
    const LOGIN_INFO = {
        uniqueID: 'n.a.',
        userUPN: 'n.a.',
        userStatus: 'n.a.',
    };
    event['loginInfo'] = LOGIN_INFO;
    return event;
}

const generateStepAdobeAnalyticsStep12b = session => {
    const serviciu = session.ee_serviciu || session.gaz_serviciu;
    const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

    const offer = {
        offerCategory: serviciu.cod,
        offerName: serviciu.denumire,
        offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
        offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business',
        offerCounty: session.judet, //
        annualConsumption
    };
    const eventType = 'subscriptionFormStep12b';
    const pageInfo = { ...PAGE_INFO };
    const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
    pageInfo.pageType = 'subscription form';
    pageInfo.pageName = 'subscription form:contract confirmation';
    pageInfo.level1 = 'subscription form';
    pageInfo.level2 = 'contract confirmation';
    pageInfo.level3 = '';
    let provider = '';
    if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
        provider = 'PPC muntenia sa';
    } else {
        provider = 'PPC sa';
    }
    pageInfo.provider = provider;
    const sessionId = session.id;
    const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
    const existedClient = session.backoffice ? 'no, not yet enel client' : 'yes, enel client';
    const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
    const invoice = session.ee_factura || session.gaz_factura;
    const waySendingBill = invoice ? (invoice.mod_corespondenta == 'POSTA' ? 'at home' : (invoice.mod_corespondenta == 'MAIL' ? 'email' : 'sms')) : '';

    const offerInfo = [offer];
    const event = {
        event: eventType,
        subscriptionInfo: {
            subscriptionChoice,
            processID: sessionId,
            currentProvider,
            currentHolder,
            existedClient,
            waySendingBill,
        },
        pageInfo,
        offerInfo,

    };
    
    const LOGIN_INFO = {
        uniqueID: 'n.a.',
        userUPN: 'n.a.',
        userStatus: 'n.a.',
    };
    event['loginInfo'] = LOGIN_INFO;
    return event;
}

module.exports = app => {
    app.get('/landing/reset-password/:userID/:contactType/:hash',cors(corsOptions), validateHash(app), async (req, res, next) => {
        res.status(200).send('Check your e-mail/phone for the new password.');
    });

    //#region contract page and document download
    app.get('/landing/:hash/:sessionid',cors(corsOptions), validateHash(app), async (req, res, next) => {
        if (!req.locals.valid)
            return next();

        const session = req.locals.session;
        const secret = session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(session.id.toString()).digest('hex');
        let generatedDocuments = session[`${req.query.type.toLowerCase()}_generated_documents`];

        // Apply condition for all sessions not only swSupplier === true && swOwner === false
        // let swSupplier = false;
        // let swOwner = false;
        // let serviceUntil = 0;
        let offerDate = 0;

        switch (session.type) {
            case 'EE':
                // swSupplier = session.ee_schimba_furnizor;
                // swOwner = session.ee_schimba_titular;
                // serviceUntil = session.ee_serviciu_pana_la;
                offerDate = session.ee_offer_date;
                break;
            case 'GAZ':
                // swSupplier = session.gaz_schimba_furnizor;
                // swOwner = session.gaz_schimba_titular;
                // serviceUntil = session.gaz_serviciu_pana_la;
                offerDate = session.gaz_offer_date;
                break;
        }

        //if (swSupplier === true && swOwner === false &&  (moment(offerDate).add(120, 'h') <= moment() || moment().isAfter(moment(serviceUntil).endOf('day')))) {
        if (moment(offerDate).add(120, 'h') <= moment()) {
            return res.redirect(PPC_REDIRECT);
        }

         for (let doc of generatedDocuments) {
            //check if session.cnp === doc.cnp
            if (doc.type === 'CTR_ELEC' || doc.type === 'CTR_GAZ') {
            try {
            let buff = await fileHelper.readFile(`${global.uploadpath}/${session.id}/generated/${req.query.type.toUpperCase()}_${doc.name}`);
            const foundCNP = await pdfHelper.findCNP(buff, session.contract_type === 'b2b' ? session.company.data.cui : session.client.cnp);
            if (!foundCNP) {
            return res.redirect(PPC_REDIRECT);
            }
                 } catch (err) {
            console.error('landing page error: ', err);
            return res.redirect(PPC_REDIRECT);
            }
             }

            const stats = fs.statSync(`${global.uploadpath}/${session.id}/generated/${req.query.type.toUpperCase()}_${doc.name}`);
            doc.size = filesize(stats.size, {exponent: 2});

            doc.url = `${global.absoluteUrl}/landing/${computedHash}/${session.id}/${doc.name}?type=${req.locals.type}`;
            doc.timestamp = moment(session.createdAt).format('D MMM YYYY');
            doc.isEE = req.query.type === 'EE';
            doc.label = doc.name.replace('.pdf', '');
         }

        const factura = session.type === 'EE' ? session.ee_factura : session.gaz_factura
        const invoiceSendWay = (factura['mod_corespondenta'] === 'SMS'  ? 'SMS' : (factura['mod_corespondenta'] === 'MAIL' ? 'EMAIL' : 'POSTA'))
        const invoiceContact = (factura['mod_corespondenta'] === 'SMS'  ? ': ' + factura['telefon_mobil']: (factura['mod_corespondenta'] === 'MAIL' ? ': ' + factura['email']: ''))
        const isNotPostalAddress = invoiceSendWay === 'POSTA' ? false: true;
        let model = {
            absoluteUrl: global.absoluteUrl,
            documents: generatedDocuments,
            invoiceSendWay,
            invoiceContact,
            isNotPostalAddress,
            adobeAnalyticsEvent12a: JSON.stringify(generateStepAdobeAnalyticsStep12a(session)),
            adobeAnalyticsEvent12b: JSON.stringify(generateStepAdobeAnalyticsStep12b(session)),
            activateUrl: `${global.absoluteUrl}/activate?sessionId=${session.id}&type=${req.locals.type}&hash=${req.locals.hash}`,
            downloadAllUrl: `${global.absoluteUrl}/landing/${computedHash}/${session.id}/Documente.zip?type=${req.locals.type}`,
        };
        if (req.locals.agreed === null) {
            model.showagree = true;

            let user = {
                id: session.agent_id
            };
            if (session.agent_id === null || session.agent_id === 0) {
                user = {
                    id: 0,
                    role: USER_ROLE.WEB,
                    type: USER_TYPE.WEB
                };
            }

            await app.service('session').patch(session.id,
                {[`${req.query.type.toLowerCase()}_last_page`]: enums.PAGES.ACCESARE_LINK},
                {
                    payload: {
                        user,
                        jti: session.token
                    }
                });
        }
        if(session.client_app === process.env.ANDROID_APP1) {
            model['isMobile'] = true;
        } else {
            model['isMobile'] = false;
        }
        if(session.client_app === process.env.WEB_APP) {
            model['isWebApp'] = true;
        } else {
            model['isWebApp'] = false;
        }

        model.nonce = res.locals.nonce

        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        return res.render('index', model);
    });

    app.get('/landingoffer/:hash/:offer',cors(corsOptions), validateHashOffer(app), async (req, res, next) => {
        const offer = req.params.offer
        const hash = req.params.hash

        const sequelize = app.get('sequelizeClient');
        const DocOffer = sequelize.model('documentoffers');
        const documents = await DocOffer.findAll({where: {offer_id: offer}, attributes: ['document_url'], raw: true})
        let newDocUrl = []
        for (i = 0; i < documents.length; i++) {
            let name = documents[i].document_url.split("_").pop();
            let link = `${global.absoluteUrl}/downloadofferdocs/${hash}/${offer}/${documents[i].document_url}`
            newDocUrl.push({name: name, link: link})
        }

        let model = {
            absoluteUrl: global.absoluteUrl,
            documents: newDocUrl
        };


        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        return res.render('offer', model);
    });
    app.get('/downloadofferdocs/:hash/:offer/:name',cors(corsOptions), validateHashOffer(app), async (req, res, next) => {
        const offer = req.params.offer
        const name = req.params.name
        var fs = require("fs");
        var file = fs.createReadStream(`${global.uploadpath}/offers/${offer}/${name.toString()}`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${name}`);
        file.pipe(res);
    });

    //doctype EE_<tip>
    app.get('/landing/:hash/:sessionid/:docname',cors(corsOptions), validateHash(app), async (req, res, next) => {
        if (!req.locals.valid)
            return next();

        const type = req.locals.type;
        const docname = req.params.docname;
        const session = req.locals.session;

        if (docname === 'print') {
            res.contentType = 'application/octet-stream';
            let buff = await fileHelper.readFile(`${global.uploadpath}/${session.id}/${type}_print.pdf`);
            return res.send(buff);
        }

        let documents = session[`${type.toLowerCase()}_generated_documents`];
        let doc = documents.find(x => x.name === docname);

        // allow user to download zip containing all generated files
        if (docname === 'Documente.zip') {
            doc = {
                signed: true,
                name: 'Documente.zip',
            };
        }

        if (!doc)
            return res.status(404).json('file not found');

        try {
            res.contentType = 'application/octet-stream';
            let buff = await fileHelper.readFile(`${global.uploadpath}/${session.id}/generated/${type}_${doc.name}`);
            return res.send(buff);
        } catch (err) {
            if (docname === 'Documente.zip') {
                await createDocsArchive(documents, session.id, type);
                res.contentType = 'application/octet-stream';
                let buff = await fileHelper.readFile(`${global.uploadpath}/${session.id}/generated/${type}_${doc.name}`);
                return res.send(buff);
            }

            return res.status(404).json('file not found');
        }
    });
    //#endregion

    app.get('/images/invoice-examples/:docname',cors(corsOptions), async (req, res, next) => {
        const docname = req.params.docname;
        try {
            const buff = await fileHelper.readFile(`${global.uploadpath}/invoice-examples/${docname}`);
            res.contentType = 'application/octet-stream';
            return res.send(buff);
        } catch (err) {
            return res.status(404).json('file not found');
        }
    });

    app.get('/uploaded/all/:sessionid/:hash/UploadedDocs.zip',cors(corsOptions), async (req, res, next) => {
        const {sessionid} = req.params;
        const baseDir = `${global.uploadpath}/${sessionid}/`;

        try {
            const files = (await fileHelper.getFiles(baseDir)).filter(file => !file.match('.zip')).map(file => baseDir + file);
            await createArchive(files, baseDir + 'UploadedDocs.zip');
            res.contentType = 'application/octet-stream';
            let buff = await fileHelper.readFile(`${baseDir}/UploadedDocs.zip`);
            return res.send(buff);
        } catch (err) {
            return res.status(404).json('file not found');
        }
    })

    app.get('/uploaded/:sessionid/:hash',cors(corsOptions), validateDocAccess(app), async (req, res, next) => {
        const {sessionid} = req.params;
        let { type, documentType, side } = req.query;
        if (!sessionid || !type || !documentType) {
            return res.redirect(PPC_REDIRECT);
        }

        type = type.toUpperCase();
        documentType = documentType.toUpperCase();

        const extension = ['CI','CIS','CEI', 'SEMNATURA_CLI', 'SEMNATURA_AGENT'].includes(documentType) ? 'jpg' : 'pdf';
        const path = `${global.uploadpath}/${sessionid}/${type}_${documentType}${side ? '_' + side : ''}.${extension}`;
        try {
            const buff = await fileHelper.readFile(path);
            res.contentType = 'application/octet-stream';
            return res.send(buff);
        } catch (err) {
            return res.status(404).json('file not found');
        }
    });

    app.delete('/uploaded/:sessionid/:hash',cors(corsOptions), validateDocAccess(app), async (req, res, next) => {
        const {sessionid} = req.params;
        let {type, documentType} = req.query;
        if (!sessionid || !type || !documentType) {
            return res.redirect(PPC_REDIRECT);
        }

        type = type.toUpperCase();
        documentType = documentType.toUpperCase();

        const extension = 'pdf';

        const sessions = (await app.service('session').find({query: {id: sessionid}})).data;
        if (sessions.length) {
            const docs = sessions[0][`${type.toLowerCase()}_documents`];
            if (docs && docs.length) {
                await app.service('session').Model.update({
                    [`${type.toLowerCase()}_documents`]: docs.filter(doc => doc.type !== documentType),
                    client_upload_agree_date: null,
                }, {where: {id: sessionid}});
            }
        }

        try {
            if (documentType == 'CI') {
                await fileHelper.deleteFile(`${global.uploadpath}/${sessionid}/${type}_${documentType}.pdf`);
                await fileHelper.deleteFile(`${global.uploadpath}/${sessionid}/${type}_${documentType}.jpg`);
            } else if (documentType == 'CIS' || documentType == 'CEI') {
                await fileHelper.deleteFile(`${global.uploadpath}/${sessionid}/${type}_${documentType}_FRONT.jpg`);
                await fileHelper.deleteFile(`${global.uploadpath}/${sessionid}/${type}_${documentType}_BACK.jpg`);
                await fileHelper.deleteFile(`${global.uploadpath}/${sessionid}/${type}_${documentType}.pdf`);
            } else {
                await fileHelper.deleteFile(`${global.uploadpath}/${sessionid}/${type}_${documentType}.${extension}`);
            }
            return res.json({success: true});
        } catch (err) {
            return res.status(404).json('file not found');
        }
    });

    //#region express app
    console.log('Registering PPC CMS');
    //register controllers
    app.use('/cms/login', require('./controllers/loginController.js')(app));
    // app.use('/cms-v2/login', require('./controllers/loginController.js')(app));
    app.use('/cms-v2/login', require('./controllers/loginController-v2.js')(app));
    app.use('/cms/proxy', require('./controllers/proxyController.js')(app));
    app.use('/cms', require('./controllers/homeController.js')(app));
    app.use('/cms-v2', require('./controllers/homeController-v2.js')(app));

    //error handler for CMS
    app.use(['/cms/*', '/cms-v2/*'], function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
    app.use(['/cms/*', '/cms-v2/*'], (req, res, next) => {
        return res.sendStatus(404);
    });

    app.use('/enel-easy-terms-and-conditions', (req, res, next) => {
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        return res.render('terms');
    });
    //#endregion
};

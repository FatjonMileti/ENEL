const soap = require('strong-soap').soap;
const request = require('request');
const path = require('path');
const moment = require('moment');
const fileHelper = require('./file.helper');
const SmsLogs = require('../models/smslogs.model');

// const { WSDL_USER, WSDL_PASS } = process.env;

const getSoapClientAsync = () => {
    return new Promise((resolve, reject) => {
        let soapOts = {};

        /*if (process.env.NODE_ENV !== 'development') {
            const reqOpts = request.defaults({ 'proxy': process.env.PROXY });
            soapOts = { 'request': reqOpts };
        }*/

        soap.createClient('./web2sms-wsdl.xml', soapOts, (err, client) => {
            if (err) {
                reject(`Error creating SOAP client: ${err}`);
            } else {
                // if (WSDL_USER && WSDL_PASS) {
                //     client.setSecurity(new soap.BasicAuthSecurity(WSDL_USER, WSDL_PASS));
                // }
                resolve(client);
            }
        });
    });
}

const callSoapMethod = (client, methodName, requestArgs) => {
    const method = client[methodName];
    return new Promise((resolve, reject) => {
        method(requestArgs, function (err, result, envelope) {
            if (process.env.NODE_ENV === 'development')
                console.log(client.lastRequest);
            if (err) {
                return reject(`Error in SOAP call to ${methodName}: ${err}`);
            }

            if (result.WSResponse && result.WSResponse.status != 'OK') {
                const error = new Error(`${methodName} error: Wrong WSResponse status: ${result.WSResponse.status} and message: ${result.WSResponse.message}`);
                reject(error);
            } else {
                resolve(result);
            }
        },
            { timeout: 400000 },
            { 'Content-Type': `application/soap+xml;charset=UTF-8;action=${methodName}` }
        );
    });
}

const sendSMS = async ({ recipient, message, subject = 'Activation', sessionID = '' }) => {
    const client = await getSoapClientAsync();
    try {
        const response = await callSoapMethod(client, 'sendSmsAuthKey', {
            username: process.env.WEB2SMS_USER,
            authKey: process.env.WEB2SMS_KEY,
            sender: process.env.WEB2SMS_SENDER,
            scheduleDate: null,
            validity: 180,
            callbackUrl: '',
            recipient,
            message,
        });

        if(response.id.$value){
            await smsFunctionLogs(recipient,message,response.id.$value)
        }else{
            return { status: false, message: error.message };
        }
       
        await logSms(recipient, subject, message, sessionID);
        return { status: true, message: 'OK' };
    } catch (error) {
        return { status: false, message: error.message };
    }
};



const smsFunctionLogs = async (telefon,message,smsId,flow="")=>{
    require('dotenv').config();
    let schema = process.env.PG_SCHEMA;
    const context = require('../../backoffice.processor/data.js');
    const smsModel = SmsLogs(context);
    const sms = {
        smslogid: smsId,
        phone: telefon,
        text: message,
        flow: flow
    };
    await smsModel.create(sms);
    // const query = `INSERT INTO "${schema}".smslogs (smslogid,phone,text,flow) VALUES ('${smsId}','${telefon}','${message}','${flow}')`
    // await context.query(query);
}


const logSms = async(to, subject, data, sessionID) => {
    const UPLOADS_PATH = path.join(path.resolve(__dirname), '../../uploads');
    const LOGS_PATH = path.join(path.resolve(__dirname), '../../logs');
    const re = new RegExp(':', 'g');
    let fileName = `${LOGS_PATH}/smses/${moment().format('YYYY-MM-DD HH:mm:ss').replace(re, '_')} - ${to} - ${subject}.txt`;

    if (sessionID !== '') {
        fileName = `${UPLOADS_PATH}/${sessionID}/smses/${moment().format('YYYY-MM-DD HH:mm:ss').replace(re, '_')} - ${to} - ${subject}.txt`;
        await fileHelper.mkdir(`${UPLOADS_PATH}/${sessionID}`);
        await fileHelper.mkdir(`${UPLOADS_PATH}/${sessionID}/smses`);
    } else {
        try {
            await fileHelper.mkdir(`${LOGS_PATH}/smses`);
        } catch (err) {
            console.log('...............................CREATE SMSES FOLDER ERROR: ', err);
        }       
    }

    await fileHelper.writeFile(fileName, `
        TO: ${to}
        TIMESTAMP: ${moment().format('YYYY-MM-DD HH:mm:ss')}
        SUBJECT: ${subject}
        SESSION: ${sessionID}
        BODY: ${data}`);
};

module.exports = { sendSMS: sendSMS };

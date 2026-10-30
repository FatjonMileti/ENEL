/* eslint-disable no-unused-vars */
const { GeneralError, BadRequest } = require('@feathersjs/errors');
const request = require('request');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        return [];
    }

    async get(id, params) {
        return {
            id,
            text: `A new message with ID: ${id}!`
        };
    }

    async create(data, params) {
        //general props from hooks
        let session = params.session;

        if (!params.query.type)
            throw new BadRequest('type parameter is required');
        if (['identity', 'bill'].indexOf(params.query.type) === -1)
            throw new BadRequest('Type must have a value in identity, bill');

        if (params.query.type === 'bill') {
            if (!params.query.billType)
                throw new BadRequest('The "billType" parameter is required');
            if (!params.query.energyType)
                throw new BadRequest('The "energyType" parameter is required');
        }

        if (!params.files || !params.files.doc)
            throw new BadRequest('The "doc" parameter is required');
        let files = [];

      
        Object.keys(params.files).forEach(x => {
            console.log({x})
            params.files[x].key = x;
            files.push(params.files[x])
        });
        if (files.length === 0)
            throw new BadRequest('No documents uploaded');

        //http://ocrservice.fullscreendigital.com/api/v2/identity

        console.log({files})


        // proxy requests
        let url = files.length > 1 && params.query.type === 'identity' 
        ? `${process.env.OCR_SERVER}v2/${params.query.type}` 
        : `${process.env.OCR_SERVER}/${params.query.type}`;

        if (params.query.type === 'bill') {
            url += `/${params.query.billType}?energyType=${params.query.energyType}`;
        }
        let options = {
            timeout: 10000,
            headers: {
                Authorization: params.headers.authorization
            },
        };

        let response = await new Promise((resolve, reject) => {
            let r = request;
            /*if (process.env.NODE_ENV !== 'development') {
                r = r.defaults({ 'proxy': process.env.PROXY })
            }*/
            let _r = r.post(url, options, function (err, response, body) {
                if (err)
                    return resolve({ success: true, res: {} });
                if (response.statusCode !== 200)
                    return resolve({ success: true, res: {} });

                return resolve({ success: true, res: JSON.parse(body) });
            });

            let form = _r.form();
            for (let file of files) {
                form.append(file.key.startsWith('doc') ? 'doc' : file.key, file.data, {
                    filename: file.name,
                    contentType: file.mimetype
                });
            }
        });

        params.query = {};
        await this.sessionService.patch(session.id, { ocr_count: ++session.ocr_count }, params);

        if (!response.success)
            throw new GeneralError(response.res);
        return response.res && JSON.parse(JSON.stringify(response.res).normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    }

    async update(id, data, params) {
        return data;
    }

    async patch(id, data, params) {
        return data;
    }

    async remove(id, params) {
        return { id };
    }

    setup(app, path) {
        this.app = app;
        this.sessionService = app.service('session');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;

/**
 * 
 * {
    "id": "2760925120661",
    "firstName": "IULIA-CORINA",
    "lastName": "VARGA",
    "series": "CJ",
    "seriesNo": "1004541",
    "issued": "",
    "nationality": "Romana",
    "nationalityCode": "ROU",
    "validity": {
        "fullValidity": "",
        "since": "",
        "until": "2032-09-21T00:00:00.000Z"
    },
    "address": {
        "county": "",
        "city": "",
        "sector": "",
        "streetType": "",
        "streetName": "",
        "streetNo": "",
        "building": "",
        "entrance": "",
        "floor": "",
        "flat": "",
        "postalCode": ""
    },
    "placeOfBirth": {
        "fullPlace": "",
        "county": "",
        "city": "",
        "sector": ""
    },
    "mrzCode": "",
    "mrzValid": false,
    "gender": "F",
    "birthDate": "25.09.1976",
    "availableUntil": "21.09.2032",
    "availableUntilYear": "2032",
    "availableUntilMonth": "09",
    "availableUntilDay": "21",
    "version": 2
}

v2

{
    "id": "2760925120661",
    "firstName": "IULIA CORINA",
    "lastName": "VARGA",
    "series": "CJ",
    "seriesNo": "1004541",
    "issued": "SPCJEP CLUJ",
    "nationality": "Romana",
    "nationalityCode": "ROU",
    "validity": {
        "fullValidity": "22.09.2022-21.09.2032",
        "since": "2022-09-22T00:00:00.000Z",
        "until": "2032-09-21T00:00:00.000Z"
    },
    "address": {
        "fullAddress": "Jud. CJ Mun. Cluj-Napoca ROU Str. Liviu Rebreanu nr.60 sc.III et.II ap.50 00050000",
        "county": "Cluj",
        "city": "Cluj-Napoca",
        "sector": "",
        "streetType": "Str",
        "streetName": "Liviu   Rebreanu  ",
        "streetNo": "60",
        "building": "",
        "entrance": "III",
        "floor": "II",
        "flat": "50",
        "postalCode": ""
    },
    "placeOfBirth": {
        "fullPlace": "",
        "county": "",
        "city": "",
        "sector": ""
    },
    "mrzCode": "IDROUCJ10045414<2760925120661<\n7609251F3209217ROU<<<<<<<<<<<3\nVARGA<<IULIA<CORINA<<<<<<<<<<<",
    "mrzValid": true,
    "gender": "F",
    "birthDate": "25.09.1976",
    "availableUntil": "21.09.2032",
    "availableUntilYear": "2032",
    "availableUntilMonth": "09",
    "availableUntilDay": "21",
    "availableSince": "22.09.2022",
    "availableSinceYear": "2022",
    "availableSinceMonth": "09",
    "availableSinceDay": "22",
    "version": 2
}
 */
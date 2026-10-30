const { BadRequest, GeneralError } = require('@feathersjs/errors');
const fileHelper = require('../../utils/file.helper.js');
const enums = require('../../utils/enums.js');

let DOCUMENT_TYPES = ['OFFER_DOCUMENT'];
const DOCUMENT_EXTENSIONS = Object.freeze(['pdf']);
// const DOCUMENT_EXTENSIONS = Object.freeze(['jpg', 'png', 'gif', 'bmp', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'tiff', 'tif', 'zip', 'csv']);
for (const key of Object.keys(enums.signatureMap.EE))
    DOCUMENT_TYPES.push(key);
for (const key of Object.keys(enums.signatureMap.GAZ))
    DOCUMENT_TYPES.push(key);
for (const key of Object.keys(enums.agentSignatureMap.EE))
    DOCUMENT_TYPES.push(key);
for (const key of Object.keys(enums.agentSignatureMap.GAZ))
    DOCUMENT_TYPES.push(key);

DOCUMENT_TYPES = [...new Set(DOCUMENT_TYPES)];

/* eslint-disable no-unused-vars */
class Service {
    constructor(options) {
        this.options = options || {};
    }

    async create(data, params) {
        const documentType = params.query.documentType;
        const type = params.query.type;

        const {offer_id} = data

        if(!offer_id){
            throw new BadRequest('The "offer_id" parameter is required');
        }
        if (!documentType)
            throw new BadRequest('The "documentType" parameter is required');
        if (DOCUMENT_TYPES.indexOf(documentType) === -1)
            throw new BadRequest('Invalid document type');
        if (!params.files || !params.files.doc)
            throw new BadRequest('The "doc" parameter is required');

        let files = params.files.doc;
        if (!(files instanceof Array)) {
            files = [files];
        }
       
        if (files.length === 0)
            throw new BadRequest('No documents uploaded');

        let extension;
        for (const file of files) {
            if (file.name.indexOf('.') === -1) {
                file.name += '.jpg';
                // throw new BadRequest('Document extension is invalid');
            }

            let ext = file.name.split('.').pop().toLowerCase();
            if (!extension)
                extension = ext;

            // if (extension !== ext)
            //     throw new BadRequest('All files neet to have the same extension');

            if (DOCUMENT_EXTENSIONS.indexOf(ext) === -1)
                throw new BadRequest('Document extension is invalid');
        }


        if (params.query.extension && DOCUMENT_EXTENSIONS.indexOf(params.query.extension) > 0) {
            extension = params.query.extension;
        }

        if (extension === 'pdf' && files.length > 1) {
            throw new BadRequest('Multiple files not allowed for pdfs');
        }

        
        try {
            //folder structure
            await fileHelper.mkdir(`${global.uploadpath}/offers/`);
            await fileHelper.mkdir(`${global.uploadpath}/offers/${offer_id}`);

            if (extension === 'pdf') {
                const fileName = `${Date.now()}_${documentType}_${files[0].name}`;
                const filePath = `${global.uploadpath}/offers/${offer_id}/${fileName}`;
               
                await fileHelper.saveFile(files[0], filePath);

                const newOffer = {
                    offer_id: offer_id,
                    document_url: fileName,
                    createdAt: new Date(),
                    updatedAt: new Date() 
                }
 
                const sequelize = this.app.get('sequelizeClient');
                const DocOffer = sequelize.model('documentoffers');
                const docCreate = await DocOffer.create(newOffer).then((success) => {
                    return { success: true };
                 }).catch((error) => {
                    params.query = {};
                    return { success: false };
                 });
                 params.query = {};
                 return docCreate
            }
           
            
        }
        catch (err) {
            throw new GeneralError(err);
        }
           
    }

    setup(app) {
        this.app = app;
        this.sessionService = app.service('session');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;

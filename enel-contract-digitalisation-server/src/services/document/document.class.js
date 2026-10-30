const { BadRequest, GeneralError } = require('@feathersjs/errors');
const fileHelper = require('../../utils/file.helper.js');
const crypto = require('crypto');
const hummus = require('muhammara');
const { filesize } = require('filesize');
const fs = require('fs');
const enums = require('../../utils/enums.js');

let DOCUMENT_TYPES = [
    'INREGISTRARE_FISCALA', 
    'CI_IMPUTERNICIT', 
    'IMPUTERNICIRE',
    'CI', 
    'CIS',
    'CEI',
    'CERTIFICAT_DOMICILIU',
    'REGISTRATION_FISC_CERT', 
    'IMPUTERNICIRE_OR_DOC_CONSTITUIVE', 
    'ACT_PROPRIETAR', 
    'CER', 
    'ATR', 
    'FACT_CLIENT', 
    'SEMNATURA_CLI', 
    'ACCEPT_CONTRACT', 
    'DOC_ACORD_ACCES', 
    'ALTELE', 
    'SEMNATURA_AGENT'
];
const DOCUMENT_EXTENSIONS = Object.freeze(['jpg', 'png', 'gif', 'bmp', 'jpeg', 'pdf']);
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
        let session = params.session;
        const documentType = params.query.documentType;
        const type = params.query.type;
        const side = params.query.side; // 'FRONT' or 'BACK' for double-sided documents
        let append = false;
        if (params.query.append === 'true')
            append = true;

        if (!documentType)
            throw new BadRequest('The "documentType" parameter is required');
        if (DOCUMENT_TYPES.indexOf(documentType) === -1)
            throw new BadRequest('Invalid document type');
        if (!params.files || !params.files.doc)
            throw new BadRequest('The "doc" parameter is required');
        
        // Validate side parameter for double-sided document types
        const doubleSidedDocs = ['CIS', 'CEI'];
        if (doubleSidedDocs.includes(documentType) && side && !['FRONT', 'BACK'].includes(side))
            throw new BadRequest('Invalid side parameter. Must be FRONT or BACK');

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

        if ((documentType === 'SEMNATURA_CLI' || documentType === 'SEMNATURA_AGENT') && extension === 'pdf')
            throw new BadRequest('Document of type SEMNATURA_CLI must be an image');
        if (extension === 'pdf' && files.length > 1) {
            throw new BadRequest('Multiple files not allowed for pdfs');
        }

        let documents = session[`${type.toLowerCase()}_documents`];
        try {
            //folder structure
            await fileHelper.mkdir(`${global.uploadpath}/${session.id}`);

            //delete previous documents
            const idx = documents.findIndex(x => x.type === documentType);
            const isDoubleSided = doubleSidedDocs.includes(documentType);
            
            // Check if this is an incomplete double-sided document being built
            const isIncompleteDoubleSided = isDoubleSided && side && idx !== -1 && documents[idx].count === 0;
            
            if (idx !== -1 && !append && !isIncompleteDoubleSided) {
                // Delete existing complete documents for re-upload
                for (let i = 0; i < documents[idx].count; i++) {
                    await fileHelper.deleteFile(`${global.uploadpath}/${session.id}/${type}_${documentType}${i === 0 ? '' : '_' + i}.${documents[idx].ext}`);
                }
                
                // Also delete FRONT/BACK files for double-sided documents
                if (isDoubleSided) {
                    // Try to delete both sides if they exist
                    const extensions = ['jpg', 'png', 'jpeg', 'gif', 'bmp'];
                    for (const ext of extensions) {
                        const frontPath = `${global.uploadpath}/${session.id}/${type}_${documentType}_FRONT.${ext}`;
                        const backPath = `${global.uploadpath}/${session.id}/${type}_${documentType}_BACK.${ext}`;
                        if (fs.existsSync(frontPath)) {
                            await fileHelper.deleteFile(frontPath);
                        }
                        if (fs.existsSync(backPath)) {
                            await fileHelper.deleteFile(backPath);
                        }
                    }
                }

                documents.splice(idx, 1);
            }
            if (idx === -1)
                append = false;

            if (documentType === 'SEMNATURA_CLI' || documentType === 'SEMNATURA_AGENT') {
                let filePath = `${global.uploadpath}/${session.id}/${type}_${documentType}.${extension}`;
                await fileHelper.saveFile(files[0], filePath);

                documents.push({
                    type: documentType,
                    ext: extension,
                    count: 1,
                    timestamp: new Date()
                });
            } else if (extension === 'pdf') {
                let count = 0;
                if (append) {
                    count = documents[idx].count;

                    documents[idx].type = documentType;
                    documents[idx].ext = extension;
                    documents[idx].count = count + 1;
                    documents[idx].timestamp = new Date();
                } else {
                    documents.push({
                        type: documentType,
                        ext: extension,
                        count: 1,
                        timestamp: new Date()
                    });
                }
                await fileHelper.saveFile(files[0], `${global.uploadpath}/${session.id}/${type}_${documentType}${count === 0 ? '' : '_' + count}.${extension}`);
            } else {
                const doubleSidedDocs = ['CIS', 'CEI'];
                const isDoubleSided = doubleSidedDocs.includes(documentType);
                
                // Variables to store actual file paths for double-sided documents
                let foundFrontPath = null;
                let foundBackPath = null;
                
                // Save original image files for CI, CIS, CEI
                if (documentType === 'CI' || isDoubleSided) {
                    if (isDoubleSided && side) {
                        // Save front/back separately for double-sided documents
                        await fileHelper.saveFile(files[0], `${global.uploadpath}/${session.id}/${type}_${documentType}_${side}.${extension}`);
                    } else {
                        // Save single-sided or legacy format
                        await fileHelper.saveFile(files[0], `${global.uploadpath}/${session.id}/${type}_${documentType}.${extension}`);
                    }
                }

                // For double-sided documents, wait until both sides are uploaded before creating PDF
                if (isDoubleSided && side) {
                    // Check if both sides exist (checking all possible extensions)
                    const possibleExtensions = ['jpg', 'png', 'jpeg', 'gif', 'bmp'];
                    
                    // Find existing front file
                    for (const ext of possibleExtensions) {
                        const testPath = `${global.uploadpath}/${session.id}/${type}_${documentType}_FRONT.${ext}`;
                        if (fs.existsSync(testPath)) {
                            foundFrontPath = testPath;
                            break;
                        }
                    }
                    
                    // Find existing back file
                    for (const ext of possibleExtensions) {
                        const testPath = `${global.uploadpath}/${session.id}/${type}_${documentType}_BACK.${ext}`;
                        if (fs.existsSync(testPath)) {
                            foundBackPath = testPath;
                            break;
                        }
                    }
                    
                    const frontExists = foundFrontPath !== null;
                    const backExists = foundBackPath !== null;
                    
                    if (!frontExists || !backExists) {
                        // Only one side uploaded so far, don't create PDF yet
                        // Just update/add document metadata
                        const docIdx = documents.findIndex(x => x.type === documentType);
                        if (docIdx === -1) {
                            documents.push({
                                type: documentType,
                                ext: 'pdf',
                                count: 0, // Mark as incomplete
                                timestamp: new Date(),
                                hasFront: frontExists,
                                hasBack: backExists
                            });
                        } else {
                            documents[docIdx].hasFront = frontExists;
                            documents[docIdx].hasBack = backExists;
                            documents[docIdx].timestamp = new Date();
                        }
                        
                        params.query = {};
                        let update = {};
                        update[`${type.toLowerCase()}_documents`] = documents;
                        await this.sessionService.patch(session.id, update, params);
                        
                        return { success: true, message: 'Document side uploaded, waiting for other side' };
                    }
                }

                let count = 0;
                if (append) {
                    count = documents[idx].count;

                    documents[idx].type = documentType;
                    documents[idx].ext = 'pdf';
                    documents[idx].count = count + 1;
                    documents[idx].timestamp = new Date();
                } else {
                    documents.push({
                        type: documentType,
                        ext: 'pdf',
                        count: 1,
                        timestamp: new Date()
                    });
                }

                let part_paths = [];
                let i = 0;
                
                // For double-sided documents with both sides uploaded, include both in PDF
                if (isDoubleSided && side && foundFrontPath && foundBackPath) {
                    // Use the actual paths we found (which have the correct extensions)
                    part_paths.push(foundFrontPath);
                    part_paths.push(foundBackPath);
                } else {
                    // Regular flow for other documents
                    for (const file of files) {
                        let _path = `${global.uploadpath}/${session.id}/${type}_PART_${documentType}${i === 0 ? '' : '_' + i}.${extension}`;
                        await fileHelper.saveFile(file, _path);
                        part_paths.push(_path);
                        i++;
                    }
                }

                const outputPath = `${global.uploadpath}/${session.id}/${type}_${documentType}${count === 0 ? '' : '_' + count}.pdf`;
                const pdfWriter = hummus.createWriter(outputPath);
                Object.keys(part_paths).forEach(async i => {
                    let page = pdfWriter.createPage(0, 0, 595, 842);
                    let cxt = pdfWriter.startPageContentContext(page);
                    cxt.drawImage(10, 10, part_paths[i], {
                        index: i,
                        transformation: {
                            width: 560, //555
                            height: 842,
                            proportional: true,
                            fit: 'always'
                        }
                    });
                    await pdfWriter.writePage(page);

                    // Don't delete FRONT/BACK files for double-sided documents (keep originals)
                    const isDoubleSidedOriginal = isDoubleSided && side && (part_paths[i].includes('_FRONT.') || part_paths[i].includes('_BACK.'));
                    if (!isDoubleSidedOriginal) {
                        await fileHelper.deleteFile(part_paths[i]);
                    }
                });
                pdfWriter.end();
            }

            params.query = {};
            let update = {};
            update[`${type.toLowerCase()}_documents`] = documents;
            if (isDoubleSided || documentType === 'CI') {
                update[`client`] = {...session.client, documentType};
            }
            
            await this.sessionService.patch(session.id, update, params);

            return { success: true };
        }
        catch (err) {
            throw new GeneralError(err);
        }
    }

    async generateHash(secret, id) {
        return crypto.createHmac('sha256', secret).update(id.toString()).digest('hex');
    }

    async get(id, params) {
        let session = params.session;
        let type = params.query.type;

        let generatedDocuments = session[`${type.toLowerCase()}_generated_documents`];

        for (let doc of generatedDocuments) {
            const secret = session.secret;
            const computedHash = await this.generateHash(secret, session.id);
            doc.url = `${this.app.get('absoluteUrl')}/landing/${computedHash}/${session.id}/${doc.name}?type=${type}`;
            doc.type = doc.name;
            const stats = fs.statSync(`${global.uploadpath}/${session.id}/generated/${type.toUpperCase()}_${doc.name}`);
            doc.size = filesize(stats.size, { exponent: 2 });
        }

        return generatedDocuments;
    }

    async patch(id, data, params) {
        const {
            ee_documents,
            gaz_documents,
            ee_sign_success,
            gaz_sign_success,
            ee_sign_channel,
            gaz_sign_channel,
            ee_agree,
            gaz_agree,
            status,
            client_upload_agree_date,
            signature_agree_date,
            link_sent_date,
            abandon_type,
            abandon_details,
        } = params.session;

        const docs = { ee: {}, gaz: {}, session: {
            status,
            client_upload_agree_date,
            signature_agree_date,
            link_sent_date,
            abandon_type,
            abandon_details,
            ee_sign_success,
            gaz_sign_success,
            ee_sign_channel,
            gaz_sign_channel,
            ee_agree,
            gaz_agree,
        }};

        if (ee_documents && ee_documents.length) {
            ee_documents.forEach(doc => docs.ee[doc.type] = doc.timestamp);
        }

        if (gaz_documents && gaz_documents.length) {
            gaz_documents.forEach(doc => docs.gaz[doc.type] = doc.timestamp);
        }

        return docs;
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

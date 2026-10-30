/* eslint-disable no-unused-vars */

const hummus = require('muhammara');
const crypto = require('crypto');

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async get(id, params) {
        let session = params.session;
        let type = params.query.type;

        let generatedDocuments = session[`${type.toLowerCase()}_generated_documents`];

        const outputPath = `${global.uploadpath}/${session.id}/${type}_print.pdf`;
        const pdfWriter = hummus.createWriter(outputPath);
        let i = 1;
        for (let doc of generatedDocuments) {
            pdfWriter.appendPDFPagesFromPDF(`${global.uploadpath}/${session.id}/generated/${type}_${doc.name}`);

            if (i < generatedDocuments.length) {
                const pages = hummus.createReader(`${global.uploadpath}/${session.id}/generated/${type}_${doc.name}`).getPagesCount();
                if (pages % 2 !== 0)
                    pdfWriter.writePage(pdfWriter.createPage(0, 0, 595, 842));
            }
            i++;
        }
        pdfWriter.end();

        const secret = session.secret;
        const computedHash = crypto.createHmac('sha256', secret).update(session.id.toString()).digest('hex');
        return {
            url: `${this.app.get('absoluteUrl')}/landing/${computedHash}/${session.id}/print?type=${type}`
        };
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

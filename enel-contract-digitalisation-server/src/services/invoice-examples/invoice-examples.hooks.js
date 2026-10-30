const { BadRequest } = require('@feathersjs/errors');
const hooks = require('feathers-hooks-common');
var randomstring = require("randomstring");
const fileHelper = require('../../utils/file.helper.js');

const DOCUMENT_EXTENSIONS = Object.freeze(['jpg', 'png', 'gif', 'bmp', 'jpeg', 'pdf']);
const PATH = 'invoice-examples';
const PATH_PATCH = 'images';

module.exports = {
    before: {
        all: [],
        find: [],
        get: [hooks.disallow('external')],
        create: [(context) => {
            const params = context.params;
            const data = context.data;
            context.data = Object.assign(context.params.query);

            if (!context.params.files || !context.params.files.doc) {
                throw new BadRequest('The "doc" parameter is required');
            }

            const file = params.files.doc;
            if (file.name.indexOf('.') === -1) {
                throw new BadRequest('INVALID_EXTENSION');
            }

            const extension = file.name.split('.').pop().toLowerCase();

            if (DOCUMENT_EXTENSIONS.indexOf(extension) === -1) {
                throw new BadRequest('INVALID_EXTENSION');
            }

            context.data.image = `${randomstring.generate(32)}.${extension}`;
            fileHelper.mkdir(`${global.uploadpath}/${PATH}`);
            fileHelper.saveFile(file, `${global.uploadpath}/${PATH}/${context.data.image}`);
        }],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [(context) => {
            context.result.data.forEach((image, index) => {
                context.result.data[index].url = `${context.app.get('absoluteUrl')}/${PATH_PATCH}/${PATH}/${context.result.data[index].image}`
            });
        }],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [ async (context) => {
            if (context.result && context.result.image) {
                await fileHelper.deleteFile(`${global.uploadpath}/${PATH}/${context.result.image}`)
            }
        }]
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};


// if (!context.params.files || !context.params.files.doc)
//     throw new BadRequest('The "doc" parameter is required');

// context.data = Object.assign(context.params.query);
// const file = context.params.files.doc;
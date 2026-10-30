/* eslint-disable no-unused-vars */
const logger = require('winston');

class ImportService {
  constructor (options) {
    this.options = options || {};
  }

  setup(app) {
    this.app = app;
    this.arteraService = app.service('artera');
  }

  async find (params) {
    const artere = await this.arteraService.create({text: 'cici are artere'});
    const results = await this.importServicesType();
    logger.info(`Importing services type at: ${new Date()}: ${results}`);
    return results;
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current)));
    }

    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }

  async importServicesType() {
    logger.info(`Importing services type at: ${new Date()}`);

    return Array.from({length: 5}, () => Math.floor(Math.random() * 5));
  }
}

module.exports = function (options) {
  return new ImportService(options);
};

module.exports.ImportService = ImportService;

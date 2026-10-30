/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger');

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    const nDistribEnel = 'N';
    const queryParams = params.query || {};
    const judet = queryParams.judet || {};
    const serviciuFilter = 'serviciu' in queryParams ? queryParams.serviciu.split(',') : ['EE', 'GAZ'];
    const tipClientFilter = queryParams.tipClient || 'REZIDENTIALI';
    const perioada = queryParams.perioada || '24';

    const {data: [judetZd]} = await this.judeteZdService.find({
      query: {
        jud_distributie: {$iLike: judet},
        $limit: 1
      }
    });

    logger.debug(`ZD Judet = ${JSON.stringify(judetZd)}`);

    let query = {
      serviciu: {$in: serviciuFilter},
      seg: tipClientFilter,
      // cod: { $like: `%${perioada}`},
      $limit: 1000
    };


    if(judetZd.distributie_enel === nDistribEnel) {
      query.tip = {$like: '%Ext%'};
    }

    const {data: serviceOffers} = await this.offersService.find({
      query
    });

    serviceOffers.map( serviceOffer => logger.info(`Service Offer = ${JSON.stringify(serviceOffer)}`));
    logger.debug(`offers = ${JSON.stringify(serviceOffers)}`);

    return serviceOffers;
  }

  setup(app) {
    this.app = app;
    this.offersService = app.service('service-offers');
    this.judeteZdService = app.service('judete-zd');
  }

}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;

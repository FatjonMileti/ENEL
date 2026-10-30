const { BadRequest } = require('@feathersjs/errors');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    const { pod } = params.query;
    const response = {
      success: false,
      sessionId: 0,
      type: '',
      refuzContract: false,
      retrimitereLink: false,
      message: ''
    };
   
    try {
      const nlc = await this.validateNlcService.get(pod);
      const sqlField = `${nlc.type.toLowerCase()}_loc.cod_pod`;

      const currentSess = await this.sessionService.Model.findOne({
        where: [
          { [sqlField]: { [Op.eq]: pod } },
          { [Op.or]: [{ status: 'OFFER' }, { status: 'OFFER_ERR' }, { status: 'SIGN' }] }
        ]
      });

      const offerDate = moment(currentSess[`${nlc.type.toLowerCase()}_offer_date`]);
      const newOfferDate = moment(offerDate).add(48, 'hours');
      // SERVER DATE IS DIFFERENT FROM DB DATE
      const timeCondition = newOfferDate.isAfter();
      const resendLinkCounter = currentSess[`resend_link_counter`];

      response.success = true;
      response.sessionId = currentSess.id;
      response.type = nlc.type;
      response.refuzContract = true;

      if (timeCondition && (resendLinkCounter < 2)) {
        response.retrimitereLink = true;
      } else {
        response.message = 'Timpul a expirat sau s-a retrimis link-ul de 2 ori.';
      }

      return response;
    } catch (err) {
      console.log('............ERR: ', err);
      response.message = 'Sesiunea nu a fost gasita.';
      return response;
    }
  }

  setup(app) {
    this.app = app;
    this.sessionService = this.app.service('session');
    this.validateNlcService = this.app.service('validate-nlc');
  }
}

module.exports = options => {
  return new Service(options);
};

module.exports.Service = Service;

/* eslint-disable no-unused-vars */
const SoapWrapper = require("../../internal-services/soap/soap-wrappers");
const { GeneralError, BadRequest } = require("@feathersjs/errors");
const { request, trim } = require("../../utils/common.js");
const moment = require("moment");
const soapMethods = new SoapWrapper();

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }

  // TODO Maybe should optimize the call to DB and use only STRADA cause it contains already localitate(maybe they are not the same though)
  async get(nlc, params) {
    nlc = trim(nlc);

    if (params.client_app === process.env.WEB_APP) {
      const code = params.query.code;
      if (!code) throw new BadRequest("captcha 'code' is required");

      if (process.env.NODE_ENV !== "development") {
        const captcha = JSON.parse(
          await request({
            method: "POST",
            uri: "https://www.google.com/recaptcha/api/siteverify",
            body: {
              secret: process.env.CAPTCHA_SECRET,
              response: code,
            },
          }),
        );

        if (!captcha.success) throw new BadRequest("Bad captcha!");
      }
    }
    const stradaService = this.app.service("strada");
    const localitateService = this.app.service("localitate");
    const distribuitorService = this.app.service("distribuitor");
    let result = {};
    try {
      result = await soapMethods.wsGetInfoNLC(nlc);

      const [
        [strada],
        {
          data: [localitate],
        },
        {
          data: [distribuitor],
        },
      ] = await Promise.all([
        stradaService.find({ query: { internal_id: result.streetId } }),
        localitateService.find({ query: { internal_id: result.cityId } }),
        distribuitorService.find({
          query: { internal_id: result.distributorId },
        }),
      ]);

      result.denumireStrada = strada.denumire;
      result.denumireLocalitate = localitate.denumire;
      result.denumireDistribuitor = distribuitor.denumire;

      if (result.valabilitate) {
        result.valabilitate = moment(result.valabilitate).format("YYYY-MM-DD");
      }
      if (result.data_atr) {
        result.data_atr = moment(result.data_atr).format("YYYY-MM-DD");
      }

      const prosumer = result?.prosumer;
      if (prosumer === "true" || prosumer === true) {
        result.isProsumers = true;
      } else if (prosumer === "false" || prosumer === false) {
        result.isProsumers = false;
      } else {
        try {
          const { Places } = await soapMethods.validatePlace("POD", nlc);
          const currentPlace = Places?.find((place) => place.code === nlc);
          result.isProsumers = currentPlace?.prosumer === "true";
        } catch {
          result.isProsumers = false;
        }
      }
      return result;
    } catch (error) {
      const { Places } = await soapMethods.validatePlace("POD", nlc);
      const currentPlace = Places?.find((place) => place.code === nlc);
      result.isProsumers = currentPlace?.prosumer === "true";
      result.status = "NOK";
      return result;
    }
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current)));
    }

    return data;
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

  setup(app) {
    this.app = app;
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;

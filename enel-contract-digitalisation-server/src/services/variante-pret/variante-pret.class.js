const logger = require("../../utils/logger");

const SoapVariantePret = require("../../internal-services/soap/soap-variante-pret");
const soapMethods = new SoapVariantePret();

// const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
// const soapMethods = new SoapWrapper();

class Service {
  constructor(options) {
    this.options = options || {};
    this.userService = "";
  }

  async find(params) {
    const input = params.query;
    let offer;
    try {
      offer = await this.offerCacheService.Model.findAll({
        where: {
          canal: input.canal || {
            [Op.ne]: null,
          },
          segment: input.segment || "REZIDENTIALI",
          type: input.serviciu,
          judet: input.judet,
          furn24:
            input.furn24 === "false"
              ? 1
              : input.furn24 === "true"
                ? 0
                : input.furn24,
          // consum_anual_estimat: input.consum_anual_estimat,
          scadenta: input.scadenta,
        },
      });
      offer = offer.map((e) => e.dataValues);
    } catch (err) { }

    let variantePret;

    // if (offer?.length > 0) {
      variantePret = {
        variantePreturi: offer.map((e) => {
          return {
            ...e,
            cfe: e.cfe === "true",
          };
        }),
      };
    // } else {
    //   variantePret = await soapMethods.wsVariantePret(input);
    //   variantePret = {
    //     variantePreturi: variantePret.variantePreturi.map((e) => {
    //       return {
    //         canal: input.canal,
    //         type: input.serviciu,
    //         judet: input.judet,
    //         segment: input.segment || "REZIDENTIALI",
    //         furn24:
    //           input.furn24 === "false"
    //             ? 1
    //             : input.furn24 === "true"
    //               ? 0
    //               : input.furn24,
    //         // consum_anual_estimat: input.consum_anual_estimat,
    //         scadenta: input.scadenta,
    //         ...e,
    //       };
    //     }),
    //   };
    // }

    if (typeof params.payload === "undefined") return variantePret;

    let currentUser = null;
    let companyID = 0;
    let userType = "";
    let isEmployed = 0;
    let userRole = "";
    let searchOfferTipString = "";
    let specialCompany = false;
    var companiesSearchOfferCriteria = { 1000: "EKIN_Fix", 1001: "PAYP_FIX" };

    if (params.payload.user.id !== 0) {
      currentUser = await this.userService.get(params.payload.user.id);
      companyID = currentUser.companyId;
      userType = currentUser.type;
      isEmployed = currentUser.employed;
      userRole = currentUser.role;
    }

    for (let key in companiesSearchOfferCriteria) {
      if (companyID === +key) {
        searchOfferTipString = companiesSearchOfferCriteria[key];
        specialCompany = true;
      }
    }

    //filter the data for the specific session here
    if (input.sessionID) {
      const { process, subprocess } = await this.validateOfferService.get(
        input.sessionID,
        {
          query: {
            status: input.status,
            piata: input.piata,
          },
        },
      );
      variantePret.variantePreturi = variantePret.variantePreturi.filter(
        (el) =>
          !el.proces ||
          (el.proces.includes(process) &&
            (!el.subproces || el.subproces.includes(subprocess))),
      );
    }

    if (
      specialCompany &&
      userType === "vi" &&
      isEmployed !== 0 &&
      userRole === "user"
    ) {
      const companySpecificPriceVars = {
        variantePreturi: variantePret.variantePreturi.filter(
          (el) => el.tip && el.tip.includes(searchOfferTipString),
        ),
      };
      return companySpecificPriceVars;
    } else {
      const companySpecificPriceVarsExcluded = {
        variantePreturi: variantePret.variantePreturi.filter(
          (el) =>
            el.tip &&
            [
              companiesSearchOfferCriteria[181],
              companiesSearchOfferCriteria[182],
            ].indexOf(el.tip) < 0,
        ),
      };
      return companySpecificPriceVarsExcluded;
    }
  }

  async get(input, params) {
    return {
      input,
      text: `A new message with ID: ${input}!`,
    };
  }

  setup(app) {
    this.app = app;
    this.userService = this.app.service("users");
    this.offerCacheService = this.app.service("variante-pret-cache");
    this.validateOfferService = this.app.service("validate-offer");
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;

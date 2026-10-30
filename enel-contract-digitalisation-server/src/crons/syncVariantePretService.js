require("dotenv").config();
const app1 = require("../app");
const OfferCache = require("../models/variante-pret-cache.model");
const Judet = require("../models/judet.model");

const SoapVariantePret = require("../internal-services/soap/soap-variante-pret");
const soapMethods = new SoapVariantePret();

// const SoapWrapper = require('../internal-services/soap/soap-wrappers');
// const soapMethods = new SoapWrapper();
const fs = require("fs");
const path = require("path");
const variantePretSyncing = path.join(
  path.resolve(__dirname),
  "../../variante_pret_syncing",
);

const job = async (app) => {
  if (!app) app = app1;

  const offerCache = OfferCache(app);
  const judet = Judet(app);

  const judets = await judet.findAll();

  await offerCache.destroy({ truncate: true, cascade: false });
  try {
    if (fs.existsSync(variantePretSyncing)) {
      return;
    }
    fs.writeFileSync(variantePretSyncing, "");
    for (let type of ["EE", "GAZ"]) {
      for (let segment of ["REZIDENTIALI", "BUSINESS"]) {
        for (let furn24 of [0, 1]) {
          for (let j of judets) {
            for (let scadenta of [15, 30]) {
              for (let canal of [3, 4, 5, 9, 2, 6]) {
                try {
                  const input = {
                    judet: j.dataValues.denumire,
                    furn24: furn24,
                    segment: segment,
                    // consum_anual_estimat: 344,
                    serviciu: type,
                    scadenta: scadenta,
                    canal: canal,
                  };
                  const variantePret = await soapMethods.wsVariantePret(input);
                  if (
                    variantePret["variantePreturi"] != null &&
                    variantePret["variantePreturi"] != undefined
                  ) {
                    for (let vPret of variantePret.variantePreturi) {
                      await offerCache.create({
                        judet: j.dataValues.denumire,
                        furn24: furn24,
                        segment: segment,
                        scadenta: scadenta,
                        canal,
                        type: type,
                        ...vPret,
                      });
                    }
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }
        }
      }
    }

    fs.unlinkSync(variantePretSyncing);
  } catch (error) {
    console.error(error);
    fs.unlinkSync(variantePretSyncing);
  }
};

module.exports = {
  job,
};

const { soap } = require("strong-soap");
const path = require("path");

const wsdlPath = path.resolve(__dirname, "../../../wsdl-new.xml");
const clientOptions = {
  endpoint: process.env.ENDPOINT_VARIANTE_PRET || process.env.ENDPOINT,
  wsdl_headers: {
    "User-Agent": "Apache-HttpClient/4.5.5 (Java/16.0.2)",
  },
  request: require("request").defaults({
    rejectUnauthorized: false,
    headers: {
      "Accept-Encoding": "gzip,deflate",
      Connection: "Keep-Alive",
      "User-Agent": "Apache-HttpClient/4.5.5 (Java/16.0.2)",
    },
  }),
};

let cachedClient = null;

const xmlEscape = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const first = (value) => (Array.isArray(value) ? value[0] : value);

class SoapVariantePret {
  constructor(options) {
    this.options = options || {};
  }

  getClient() {
    return new Promise((resolve, reject) => {
      if (cachedClient) {
        resolve(cachedClient);
        return;
      }

      soap.createClient(wsdlPath, clientOptions, (err, client) => {
        if (err) {
          reject(`Error creating VariantePret SOAP client: ${err}`);
          return;
        }

        cachedClient = client;
        resolve(client);
      });
    });
  }

  extractSoapBody(json) {
    const envelope =
      json["SOAP-ENV:Envelope"] ||
      json["soapenv:Envelope"] ||
      json["soap:Envelope"];
    if (!envelope) {
      throw new Error("SOAP envelope missing from VariantePret response");
    }

    return first(
      envelope["SOAP-ENV:Body"] ||
        envelope["soapenv:Body"] ||
        envelope["soap:Body"],
    );
  }

  parseSoapFault(body) {
    const fault = first(
      body["SOAP-ENV:Fault"] || body["soapenv:Fault"] || body["soap:Fault"],
    );
    if (!fault) {
      return null;
    }

    return {
      code: first(
        fault["SOAP-ENV:Code"] || fault["soapenv:Code"] || fault["soap:Code"],
      ),
      reason: first(
        fault["SOAP-ENV:Reason"] ||
          fault["soapenv:Reason"] ||
          fault["soap:Reason"],
      ),
      detail: first(
        fault["SOAP-ENV:Detail"] ||
          fault["soapenv:Detail"] ||
          fault["soap:Detail"],
      ),
    };
  }

  getVariantePretResponse(body) {
    const responseKey = Object.keys(body).find((key) =>
      /VariantePretResponse$/.test(key),
    );
    if (!responseKey) {
      throw new Error("VariantePretResponse missing from SOAP body");
    }

    return first(body[responseKey]);
  }

  async wsVariantePret(varPretInput) {
    const client = await this.getClient();
    const args = {
      VariantePretRequest: {
        canal: xmlEscape(varPretInput.canal || 2),
        segment: xmlEscape(varPretInput.segment || "REZIDENTIALI"),
        serviciu: xmlEscape(varPretInput.serviciu),
        judet: xmlEscape(varPretInput.judet),
        furn24: xmlEscape(varPretInput.furn24),
        scadenta: xmlEscape(varPretInput.scadenta),
        consum_anual_estimat: xmlEscape(
          varPretInput.consum_anual_estimat || 1450,
        ),
      },
    };

    const result = await new Promise((resolve, reject) => {
      client.VariantePretNew(args, (err, response, envelope) => {
        if (err) {
          const statusCode = err.response?.statusCode;
          const responseBody = err.body || err.response?.body;
          const responseDetails = statusCode
            ? ` (status ${statusCode}${responseBody ? `, body: ${responseBody}` : ""})`
            : "";

          reject(
            `Error in SOAP call to VariantePret: ${err.message || err}${responseDetails}`,
          );
          return;
        }

        resolve(response);
      });
    });

    const wsResponse = first(result.WSResponse);
    const status = first(wsResponse && wsResponse.status);
    const message = first(wsResponse && wsResponse.message);

    if (!status || String(status).toUpperCase() !== "OK") {
      throw new Error(
        `VariantePret error: Wrong WSResponse status: ${status} and message: ${message}`,
      );
    }

    const varPreturi = first(result.VarPreturi);
    let variantePreturi = varPreturi ? varPreturi.VarPret || [] : [];
    variantePreturi =
      variantePreturi instanceof Array ? variantePreturi : [variantePreturi];

    return { variantePreturi };
  }
}

module.exports = function (options) {
  return new SoapVariantePret(options);
};

module.exports.SoapVariantePret = SoapVariantePret;

/* eslint-disable no-unused-vars */
const logger = require('../../utils/logger.js');
const moment = require('moment');
const soap = require('strong-soap').soap;


const options = {
  endpoint: process.env.ENDPOINT
};

const { WSDL_USER, WSDL_PASS } = process.env;
class SoapWrappers {

  constructor(options) {
    this.options = options || {};
  }

  getSoapClientAsync() {
    return new Promise((resolve, reject) => {
      soap.createClient('./wsdl.xml', options, (err, client) => {
        if (err) {
          reject(`Error creating SOAP client: ${err}`);
        } else {
          if (WSDL_USER && WSDL_PASS) {
            // var auth = "Basic " + new Buffer(WSDL_USER + ":" + WSDL_PASS).toString("base64");
            // client.addHttpHeader('Authorization',auth);
            client.setSecurity(new soap.BasicAuthSecurity(WSDL_USER, WSDL_PASS));
          }

          client.addSoapHeader(
            `<urn:applicationUserUuid xmlns:urn="lt:cros:ws:fsd:types">${process.env.SOAP_HEADER}</urn:applicationUserUuid>`
          );

          resolve(client);
        }
      });
    });
  }

  callSoapMethod(client, methodName, requestArgs) {
    const method = client[methodName];
    let soapAction = methodName;
    // if(methodName[0] === 'GetPlace')
    //     soapAction = ["/Service.serviceagent//GetPlace"];

    return new Promise((resolve, reject) => {
      method(requestArgs, function (err, result, envelope) {
        // console.log(`Envelope for ${methodName}: ${JSON.stringify(envelope)}`);
        // console.log(`Result for ${methodName}: ${JSON.stringify(result)}`);

        if (process.env.NODE_ENV === 'development')
          console.log(client.lastRequest);
        if (err) {
          return reject(`Error in SOAP call to ${methodName}: ${err}`);
        }
        // logger.debug(`Envelope for ${methodName}: ${JSON.stringify(envelope)}`);
        // logger.debug(`Result for ${methodName}: ${JSON.stringify(result)}`);

        if (result.WSResponse && (!result.WSResponse.status || result.WSResponse.status.toUpperCase() !== 'OK')) {
          const error = new Error(`${methodName} error: Wrong WSResponse status: ${result.WSResponse.status} and message: ${result.WSResponse.message}`);
          reject(error);
        } else {
          resolve(result);
        }

      },
        { timeout: 400000 },
        { 'Content-Type': `application/soap+xml;charset=UTF-8;action=${soapAction}` }
      );
    });
  }

  async validateVoucherRequest(voucherCode, eneltel, productCode, productName, isFriend, segment, county, cityId) {
    const requestArgs = {
      GetVouchersRequest: {
        // requestType: voucher?.requestType,
        voucher_code: voucherCode,
        eneltel: eneltel,
        isFriend: isFriend,
        ProductName: productName,
        ProductCode: productCode,
        Segment: segment,
        // SellingChannel: voucher.SellingChannel,
        Province: county,
        CityId: cityId,
        // DueDate: voucher.DueDate,
        // PenaltyAndGracePeriod: voucher.PenaltyAndGracePeriod,
        // POD: voucher.POD,
        // CNP: voucher.CNP,
        ReferenceDate: moment().format('YYYY-MM-DD'),
        // CommodityType: voucher.CommodityType,
        // sw_titular: voucher.sw_titular,
        // sw_furnizor: voucher.sw_furnizor,
        // furnizare: voucher.furnizare,

      }
    }
    const client = await this.getSoapClientAsync();
    try {
      const result = await this.callSoapMethod(client, ['GetVouchers'], requestArgs);
      return Array.isArray(result.GetVouchers.Vouchers) ? result.GetVouchers.Vouchers[0] : result.GetVouchers.Vouchers;
    } catch (error) {
      if (error.message.includes('Voucher not eligible')) {
        return {
          error: 'Voucher not eligible'
        }
      } else {
        return { error: error.message }
      }
    }

  }

  async searchFriend(eneletel) {
    const requestArgs = {
      eneletel: eneletel
    }
    const client = await this.getSoapClientAsync();
    const result = await this.callSoapMethod(client, [''], requestArgs);
    try {
      return {
        ...result
      };
    } catch (error) {
      throw error;
    }
  }

  async searchSalesForce(type, code) {

    const requestArgs = {
      GetAccountsWithPodsRequest: {},
    };
    if (type === 'POD') {
      requestArgs['GetAccountsWithPodsRequest']['pod_code'] = code;
    } else if (type === 'CNPCUI') {
      requestArgs['GetAccountsWithPodsRequest']['cnp_cui'] = code;
    } else if (type === 'PHONE') {
      requestArgs['GetAccountsWithPodsRequest']['numar_telefon'] = code;
    } else if (type === 'COD_CLIENT') {
      requestArgs['GetAccountsWithPodsRequest']['cod_client'] = code;
    }

    const client = await this.getSoapClientAsync();
    const result = await this.callSoapMethod(client, ['GetAccountsWithPods'], requestArgs);
    try {
      return {
        ...result
      };
    } catch (error) {
      throw error;
    }
  }

  async wsGetNomServicii() {

    const requestArgs = {
      NomServiciiRequest: ''
    };

    try {
      const client = await this.getSoapClientAsync();
      const result = await this.callSoapMethod(client, ['NomServicii'], requestArgs);
      return {
        tipuriServicii: result.TipuriServicii.TipServiciu,
        gameServicii: result.GameServicii.GamaServiciu,
        oferteServicii: result.OferteServicii.OfertaServiciu
      };

    } catch (err) {
      throw err;
    }
  }

  async wsGetInfoNLC(nlc) {
    const requestArgs = {
      InfoNLCRequest: {
        NLC: nlc
      }
    };

    try {
      let client = await this.getSoapClientAsync();
      const result = await this.callSoapMethod(client, ['InfoNLC'], requestArgs);

      return result.NLC;

    } catch (err) {
      throw err;
    }
  }

  async wsGetInfoClient(cnpOrCui, type) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        InfoClientRequest: {
          CNP: (!type || type === 'cnp') ? cnpOrCui : undefined,
          CUI: type && type === 'cui' ? cnpOrCui : undefined
        }
      };
      const result = await this.callSoapMethod(client, ['InfoClient'], requestArgs);
      let data = result.Clienti.Client;

      if (data instanceof Array && data.length > 0) {
        // data = data.sort((a, b) => parseInt(b.enelCustomerId) - parseInt(a.enelCustomerId));
        data = data.sort().reverse();
      }

      return data;

    } catch (err) {
      throw err;
    }
  }

  async validatePlace(type, code) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        GetPlaceRequest: {
          type,
          code
        }
      };
      // validate places
      const result = await this.callSoapMethod(client, ['GetPlace'], requestArgs);

      return result.GetPlace ? result.GetPlace : result.WSResponse;

    } catch (err) {
      throw err;
    }
  }

  async wsGetNomOperationale() {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        NomOperationaleRequest: ''
      };
      const result = await this.callSoapMethod(client, ['NomOperationale'], requestArgs);

      return {
        distribuitori: result.Distribuitori.Distribuitor,
        furnizori: result.Furnizori.Furnizor,
        banci: result.Banci.Banca,
        coduriCAEN: result.CoduriCAEN.CodCAEN,
        tipuriCanale: result.TipuriCanale.TipCanal,
        canale: result.Canale.Canal,
        kami: result.Kami.Kam,
        segmente: result.Segmente.Segment
      };

    } catch (err) {
      throw err;
    }
  }

  async wsGetNomGeografice() {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        NomGeograficeRequest: ''
      };
      const result = await this.callSoapMethod(client, ['NomGeografice'], requestArgs);

      return {
        judete: result.Judete.Judet,
        localitati: result.Localitati.Localitate,
        artere: result.Artere.Artera,
        strazi: result.Strazi.Strada,
        coduriPostale: result.CoduriPostale.CodPostal
      };

    } catch (err) {
      throw err;
    }
  }

  async wsVariantePret(varPretInput) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        VariantePretRequest: {
          canal: varPretInput.canal || 2,
          segment: varPretInput.segment || 'REZIDENTIALI',
          serviciu: varPretInput.serviciu,
          judet: varPretInput.judet,
          furn24: varPretInput.furn24,
          consum_anual_estimat: varPretInput.consum_anual_estimat || 1450,
          scadenta: varPretInput.scadenta
        }
      };
      const result = await this.callSoapMethod(client, ['VariantePret'], requestArgs);
      var variantePreturi = (result && result.VarPreturi) ? result && result.VarPreturi.VarPret : [];
      variantePreturi = (variantePreturi instanceof Array) ? variantePreturi : [variantePreturi];

      return { variantePreturi };
    } catch (err) {
      throw err;
    }
  }

  async wsLead(varLeadData, varLeadId) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        LeadRequest: {
          id_fsd: varLeadData.id_fsd,
          step_id: varLeadData.step_id || 0,
          generic_dossier_id: varLeadId || null,
          page_url: varLeadData.page_url,
          serviciu: varLeadData.serviciu,
          denumire_produs: varLeadData.denumire_produs,
          cod_oferta: varLeadData.cod_oferta,
          judet: varLeadData.judet,
          email: varLeadData.email,
          telefon: varLeadData.telefon,
          is_titular: varLeadData.is_titular,
          furnizare: varLeadData.furnizare,
          id_furnizor: varLeadData.id_furnizor,
          CNP: varLeadData.CNP,
          CUI: varLeadData.CUI,
          nume: varLeadData.nume,
          prenume: varLeadData.prenume,
          nume_companie: varLeadData.nume_companie,
          feedback_body: varLeadData.feedback_body,
          dossier_close: varLeadData.dossier_close,
          doc_ci: varLeadData.doc_ci ? {
            doc: varLeadData.doc_ci.doc,
            nume_doc: varLeadData.doc_ci.nume_doc,
            tip_doc: varLeadData.doc_ci.tip_doc
          } : varLeadData.doc_ci,
          doc_cui: varLeadData.doc_cui ? {
            doc: varLeadData.doc_cui.doc,
            nume_doc: varLeadData.doc_cui.nume_doc,
            tip_doc: varLeadData.doc_cui.tip_doc
          } : varLeadData.doc_cui,
          doc_factura: varLeadData.doc_factura ? {
            doc: varLeadData.doc_factura.doc,
            nume_doc: varLeadData.doc_factura.nume_doc,
            tip_doc: varLeadData.doc_factura.tip_doc
          } : varLeadData.doc_factura,
          NLC: varLeadData.NLC ? {
            nlc_cod_pod: varLeadData.NLC.nlc_cod_pod,
            nlc_localitate: varLeadData.NLC.nlc_localitate,
            nlc_tip_artera: varLeadData.NLC.nlc_tip_artera,
            nlc_nume_strada: varLeadData.NLC.nlc_nume_strada,
            nlc_strada: varLeadData.NLC.nlc_strada,
            nlc_nr_strada: varLeadData.NLC.nlc_nr_strada,
            nlc_bloc: varLeadData.NLC.nlc_bloc,
            nlc_scara: varLeadData.NLC.nlc_scara,
            nlc_apartament: varLeadData.NLC.nlc_apartament,
            nlc_etaj: varLeadData.NLC.nlc_etaj
          } : varLeadData.NLC
        }
      };
      const result = await this.callSoapMethod(client, ['Lead'], requestArgs);
      let { WSResponse, generic_dossier_id, generic_dossier_name } = result;
      return { WSResponse, generic_dossier_id, generic_dossier_name };
    } catch (err) {
      throw err;
    }
  }

  async wsSAPChkIdx(SAPChkData) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        SAPChkIdxRequest: {
          CADRAN: SAPChkData.CADRAN,
          CHECK_ALL: SAPChkData.CHECK_ALL,
          INDEX: SAPChkData.INDEX,
          NUMAR_FACTURA: SAPChkData.NUMAR_FACTURA,
          POD: SAPChkData.POD,
          SERIE_CONTOR: SAPChkData.SERIE_CONTOR,
          SERIE_FACTURA: SAPChkData.SERIE_FACTURA,
          SKIP_VALID_PER_AUTOC: "X"
        }
      };
      const result = await this.callSoapMethod(client, ['SAPChkIdx'], requestArgs);
      let { RETURN_DETAILS, RETURN_CODE, RETURN_MESSAGE } = result;
      return { RETURN_DETAILS, RETURN_CODE, RETURN_MESSAGE };
    } catch (err) {
      throw err;
    }
  }

  async wsSAPQueryIdx(SAPChkData) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        SAPQueryIdxRequest: {
          END_DATE: SAPChkData.END_DATE,
          ENELID: SAPChkData.ENELID,
          START_DATE: SAPChkData.START_DATE
        }
      };
      return await this.callSoapMethod(client, ['SAPQueryIdx'], requestArgs);
    } catch (err) {
      throw err;
    }
  }

  async wsGetConcursuri(concursuriInput) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        ConcursuriRequest: {
          canal: concursuriInput.canal,
          segment: concursuriInput.segment,
          serviciu: concursuriInput.serviciu,
          ebill: concursuriInput.ebill,
          id_var_pret: concursuriInput.id_var_pret,
        }
      };
      const result = await this.callSoapMethod(client, ['Concursuri'], requestArgs);
      var varianteConcursuri = result && result.VarConcursuri ? result && result.VarConcursuri.VarConcurs : [];
      varianteConcursuri = (varianteConcursuri instanceof Array) ? varianteConcursuri : [varianteConcursuri];

      return { varianteConcursuri };
    } catch (err) {
      throw err;
    }
  }

  async wsGetPrevalidationEmailCfe(prevalidationEmailCfeInput) {
    try {
      let client = await this.getSoapClientAsync();
      const requestArgs = {
        PrevalidationCfeRequest: {
          email: prevalidationEmailCfeInput.email,
          phone: prevalidationEmailCfeInput.phone,
        }
      };
      const result = await this.callSoapMethod(client, ['PrevalidationCfe'], requestArgs);
      let wsResult = result.WSResponse;
      return { wsResult };
    } catch (err) {
      throw err;
    }
  }

}

module.exports = function (options) {
  return new SoapWrappers(options);
};

module.exports.SoapWrappers = SoapWrappers;

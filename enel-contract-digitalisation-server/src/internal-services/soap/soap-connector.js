const request = require('request');
const xmlparse = require('./xmlparser');
const baseUrl = process.env.ENDPOINT;
const { normalizeString } = require('../../utils/common.js');

const { WSDL_USER, WSDL_PASS } = process.env;

const createOfferRequestXML = (data, docs) => {
  let xmldocs = '';
  // for (let doc of docs) {
  //   xmldocs += `<WSDocument>
  //           <doc>${doc.doc}</doc>
  //           <nume_doc>${doc.nume_doc}</nume_doc>
  //           <tip_doc>${doc.tip_doc}</tip_doc>
  //       </WSDocument>`;
  // }

  let xmlconturi = '';
  //   for (let cont of data.Conturi) {
  //     xmlconturi += `
  // <Cont>
  // ${format('banca', cont.banca)}
  // ${format('iban', cont.iban)}
  // </Cont>
  //     `;
  //   }

  let xmlloc = '';
  for (let loc of data.Locuri) {
    xmlloc += `
<Loc>
${format('nlc', loc.nlc)}
${format('eneltel', loc.eneltel)}
${format('denumire_loc', loc.denumire_loc)}
${format('localitate', loc.localitate)}
${format('tip_artera', loc.tip_artera)}
${format('nume_strada', loc.nume_strada)}
${format('strada', loc.strada)}
${format('nr_strada', loc.nr_strada)}
${format('bloc', loc.bloc)}
${format('scara', loc.scara)}
${format('apartament', loc.apartament)}
${format('etaj', loc.etaj)}
${format('cod_caen', loc.cod_caen || 9801)}
${format('nr_atr', loc.nr_atr)}
${format('data_atr', loc.data_atr)}
${format('nivel_tensiune', loc.nivel_tensiune)}
${format('pressure', loc.pressure)}
${format('presureLevel', loc.presureLevel)}
${format('putere', loc.putere)}
${format('categorie_gaz', loc.categorie_gaz)}
${format('distribuitor', loc.distribuitor)}
${format('valabil_act_spatiu', loc.valabil_act_spatiu)}
${format('necesar_pif', loc.necesar_pif)}
${format('cod_pod', loc.cod_pod)}
</Loc>
    `;
    // ${format('cod_caen', loc.cod_caen)}
  }

  let xmlconsumuriloc = '';

  for (let consumloc of data.ConsumuriLoc) {
    if (consumloc) {
      xmlconsumuriloc += `
<ConsumLoc>
${format('nlc', consumloc.nlc)}
${format('marime_masurata', consumloc.marime_masurata)}
${format('consum_lunar', consumloc.consum_lunar)}
${format('consum_anual', consumloc.consum_anual)}
${format('consum_01', consumloc.consum_01)}
${format('consum_02', consumloc.consum_02)}
${format('consum_03', consumloc.consum_03)}
${format('consum_04', consumloc.consum_04)}
${format('consum_05', consumloc.consum_05)}
${format('consum_06', consumloc.consum_06)}
${format('consum_07', consumloc.consum_07)}
${format('consum_08', consumloc.consum_08)}
${format('consum_09', consumloc.consum_09)}
${format('consum_10', consumloc.consum_10)}
${format('consum_11', consumloc.consum_11)}
${format('consum_12', consumloc.consum_12)}
</ConsumLoc>
    `;
    }
  }

  let xmlsemnaturi = '';
  for (let semnatura of data.Semnaturi) {
    xmlsemnaturi += `
<Semnatura>
${format('client', semnatura.client)}
${format('functia', semnatura.functia)}
${format('nume', semnatura.nume)}
</Semnatura>
    `;
  }

  let xmlconcursuri = '';
  if (data.Concursuri) {
    for (let concurs of data.Concursuri) {
      xmlconcursuri += `
            <Concurs>
            ${format('id', concurs.id)}
            ${format('acord_concurs', concurs.acord_concurs)}
            </Concurs>
                `;
    }
  }

  let xmldiscounts = '';
  for (let id of data.Discounts) {
    xmldiscounts += `
<Discount>
${format('id', id)}
</Discount>
    `;
  }

  let xml = `
<Oferta>
<id_fsd>${data.Oferta.id_fsd}</id_fsd>
${format('generic_dossier_id', data.Oferta.generic_dossier_id)}
${format('serviciu', data.Oferta.serviciu)}
${format('sw_titular', data.Oferta.sw_titular)}
${format('sw_furnizor', data.Oferta.sw_furnizor)}
${format('furnizare', data.Oferta.furnizare)}
${format('id_varianta_pret', data.Oferta.id_varianta_pret)}
${format('furnizor', data.Oferta.furnizor)}
${format('tip_contract', data.Oferta.tip_contract)}
${format('data_accept', data.Oferta.data_accept)}
${format('valabil_de_la', data.Oferta.valabil_de_la)}
${format('valabil_furnizare', data.Oferta.valabil_furnizare)}
${format('tip_canal', data.Oferta.tip_canal)}
${format('canal', data.Oferta.canal)}
${format('kam', data.Oferta.kam)}
${format('cu_avans', data.Oferta.cu_avans)}
${format('ritmfact_cod', data.Oferta.ritmfact_cod)}
${format('nume_agent', data.Oferta.nume_agent)}
${format('marca_agent', data.Oferta.marca_agent)}
${format('consumptionConventions', data.Oferta.consumptionConventions)}
</Oferta>
<Negociere>
${format('furn_24', data.Negociere.furn_24)}
${format('verde', data.Negociere.verde)}
${format('scadenta', data.Negociere.scadenta)}
${format('pret_ea', data.Negociere.pret_ea)}
${format('pret_eaz', data.Negociere.pret_eaz)}
${format('pret_eano', data.Negociere.pret_eano)}
${format('pret_eanw', data.Negociere.pret_eanw)}
${format('pret_gaz', data.Negociere.pret_gaz)}
${format('pret_tr_gaz', data.Negociere.pret_tr_gaz)}
</Negociere>
<ClientOferta>
${format('nume_companie', data.ClientOferta.nume_companie)}
${format('nume', data.ClientOferta.nume)}
${format('prenume', data.ClientOferta.prenume)}
${format('cnp_cui', data.ClientOferta.cnp_cui)}
${format('strada', data.ClientOferta.strada)}
${format('localitate', data.ClientOferta.localitate)}
${format('tip_artera', data.ClientOferta.tip_artera)}
${format('nume_strada', data.ClientOferta.nume_strada)}
${format('cod_postal', data.ClientOferta.cod_postal)}
${format('nr_strada', data.ClientOferta.nr_strada)}
${format('bloc', data.ClientOferta.bloc)}
${format('scara', data.ClientOferta.scara)}
${format('apartament', data.ClientOferta.apartament)}
${format('etaj', data.ClientOferta.etaj)}
${format('rest_adresa', data.ClientOferta.rest_adresa)}
${format('mobil', data.ClientOferta.mobil)}
${format('telefon', data.ClientOferta.telefon)}
${format('fax', data.ClientOferta.fax)}
${format('email', data.ClientOferta.email)}
${format('MobileValidated', data.ClientOferta.MobileValidated)}
${format('MobileValidationDate', data.ClientOferta.MobileValidationDate)}
${format('EmailValidated', data.ClientOferta.EmailValidated)}
${format('EmailValidationDate', data.ClientOferta.EmailValidationDate)}
${format('ci_numar', data.ClientOferta.ci_numar)}
${format('ci_emis_de', data.ClientOferta.ci_emis_de)}
${format('ci_emis_la', data.ClientOferta.ci_emis_la)}
${format('ci_seria', data.ClientOferta.ci_seria)}
${format('cod_fiscal', data.ClientOferta.cod_fiscal)}
${format('cod_onrc', data.ClientOferta.cod_onrc)}
${format('update_cros', data.ClientOferta.update_cros)}
${process.env.DISABLE_BACKOFFICE ? '' : format('transmitere_contract', data.ClientOferta.transmitere_contract)}
${format('tip_companie', data.ClientOferta.tip_companie)}
${format('cod_caen_companie', data.ClientOferta.cod_caen_companie)}
${format('nume_contact', data.ClientOferta.nume_contact)}
${format('prenume_contact', data.ClientOferta.prenume_contact)}
${format('rol_contact', data.ClientOferta.rol_contact)}
${format('cnp_contact', data.ClientOferta.cnp_contact)}
${format('telefon_contact', data.ClientOferta.telefon_contact)}
${format('email_contact', data.ClientOferta.email_contact)}
</ClientOferta>
<Interlocutor>
${format('nume', data.Interlocutor.nume)}
${format('pree', data.Interlocutor.pree)}
${format('rol', data.Interlocutor.rol)}
${format('mobil', data.Interlocutor.mobil)}
${format('telefon', data.Interlocutor.telefon)}
${format('fax', data.Interlocutor.fax)}
${format('email', data.Interlocutor.email)}
${format('mobile_validat', data.Interlocutor.mobile_validat)}
${format('email_validat', data.Interlocutor.email_validat)}
</Interlocutor>
<Corespondenta>
${format('localitate', data.Corespondenta.localitate)}
${format('tip_artera', data.Corespondenta.tip_artera)}
${format('nume_strada', data.Corespondenta.nume_strada)}
${format('strada', data.Corespondenta.strada)}
${format('nr_strada', data.Corespondenta.nr_strada)}
${format('bloc', data.Corespondenta.bloc)}
${format('scara', data.Corespondenta.scara)}
${format('apartament', data.Corespondenta.apartament)}
${format('etaj', data.Corespondenta.etaj)}
</Corespondenta>
<Conturi>
${xmlconturi}
</Conturi>
<Locuri>
${xmlloc}
</Locuri>
<ConsumuriLoc>
${xmlconsumuriloc}
</ConsumuriLoc>
<Semnaturi>
${xmlsemnaturi}
</Semnaturi>
<CFEE>
${format('acord', data.CFEE.acord)}
${format('mod_corespondenta', data.CFEE.mod_corespondenta)}
${format('email', data.CFEE.email)}
${format('nr_telefon', data.CFEE.nr_telefon)}
${format('mod_avans', data.CFEE.mod_avans)}
${format('iban', data.CFEE.iban)}
${format('eneltel', data.CFEE.eneltel)}
</CFEE>
<GDPR>
${format('acord_mk', data.GDPR.acord_mk)}
${format('acord_part', data.GDPR.acord_part)}
${format('acord_profil', data.GDPR.acord_profil)}
${format('canal_email', data.GDPR.canal_email)}
${format('email', data.GDPR.email)}
${format('canal_sms', data.GDPR.canal_sms)}
${format('sms', data.GDPR.sms)}
${format('canal_telefon', data.GDPR.canal_telefon)}
${format('telefon', data.GDPR.telefon)}
${format('canal_posta', data.GDPR.canal_posta)}
${format('localitate', data.GDPR.localitate)}
${format('tip_artera', data.GDPR.tip_artera)}
${format('nume_strada', data.GDPR.nume_strada)}
${format('strada', data.GDPR.strada)}
${format('nr_strada', data.GDPR.nr_strada)}
${format('bloc', data.GDPR.bloc)}
${format('scara', data.GDPR.scara)}
${format('apartament', data.GDPR.apartament)}
${format('etaj', data.GDPR.etaj)}
</GDPR>
<SWFurnizor>
${format('furnizor', data.SWFurnizor.furnizor)}
${format('nr_contract', data.SWFurnizor.nr_contract)}
${format('data_contract', data.SWFurnizor.data_contract)}
${format('sold', data.SWFurnizor.sold)}
${format('index_contor', data.SWFurnizor.index_contor)}
${format('serie_contor', data.SWFurnizor.serie_contor)}
${format('data_reziliere', data.SWFurnizor.data_reziliere)}
</SWFurnizor>
<SWTitular>
${format('data_act_spatiu', data.SWTitular.data_act_spatiu)}
${format('nr_act_spatiu', data.SWTitular.nr_act_spatiu)}
${format('nume_fost_proprietar', data.SWTitular.nume_fost_proprietar)}
${format('declaratie_act_proprietar', data.SWTitular.declaratie_act_proprietar)}
${format('ownership_role', data.SWTitular.ownership_role)}
${format('ownership_role_desc', data.SWTitular.ownership_role_desc)}
${format('ownership_role_start_date', data.SWTitular.ownership_role_start_date)}
</SWTitular>
${process.env.DISABLE_BACKOFFICE ? '' : `<ModTransmitere>
${format('canal_sms', data.ModTransmitere.canal_sms)}
${format('sms', data.ModTransmitere.sms)}
${format('canal_email', data.ModTransmitere.canal_email)}
${format('email', data.ModTransmitere.email)}
</ModTransmitere>`}
<Concursuri>${xmlconcursuri}</Concursuri>
<DiscountsOferta>${xmldiscounts}</DiscountsOferta>
<Readings>
${format('GAS', data.Readings.GAS)}
${format('ELE_SINGLERATE', data.Readings.ELE_SINGLERATE)}
${format('ELE_DAY', data.Readings.ELE_DAY)}
${format('ELE_NIGHT', data.Readings.ELE_NIGHT)}
${format('ELE_GOAL', data.Readings.ELE_GOAL)}
${format('ELE_INDUCTIVE', data.Readings.ELE_INDUCTIVE)}
${format('ELE_CAPACITIVE', data.Readings.ELE_CAPACITIVE)}
${format('METER_NUMBER', data.Readings.METER_NUMBER)}
</Readings>
<VoucherOffer>
${format('voucherId', data.Voucher.voucherId)}
${format('isFriend', data.Voucher.isFriend)}
${format('eneltelFriend', data.Voucher.eneltelFriend)}
</VoucherOffer>

`;

  // <WSDocuments>${xmldocs}</WSDocuments>
  return normalizeString(xml);
};

const wsRequest = (method, body, parameter) => {
  return new Promise((resolve, reject) => {
    let envelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="lt:cros:ws:fsd:types" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        ${`<soapenv:Header><urn:applicationUserUuid>Basic ${process.env.SOAP_HEADER}</urn:applicationUserUuid></soapenv:Header>`}
        <soapenv:Body>
           <urn:${parameter || method}Request>
                ${body}
           </urn:${parameter || method}Request>
       </soapenv:Body>
       </soapenv:Envelope>`;

    request({
      method: 'POST',
      uri: baseUrl,
      timeout: 3000000,
      headers: { 'Content-Type': `application/soap+xml;charset=UTF-8;action="${method}"`, 'Authorization': "Basic " + new Buffer(WSDL_USER + ":" + WSDL_PASS).toString("base64") },
      // headers: { SOAPAction: `"/Service.serviceagent//${method}"`, 'Content-Type': 'text/xml;charset=UTF-8' },
      body: envelope
    }, async function (err, response, body) {
      if (err) {
        return reject("Error on creating contract");
      }

      if (response.statusCode !== 200) {
        return reject("Error on creating contract");
      }

      let json;
      try {
        json = await xmlparse(body);
      } catch (err) {
        return reject(`Parser error: ${err}`);
      }

      let status, message, json_response, json_body, json_fault;
      try {
        json_body = json['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0];
        json_fault = json_body['SOAP-ENV:Fault'];
        if (json_fault) {
          status = 'NOK';
          message = json_fault[0]['faultstring'][0];
        } else {
          Object.keys(json_body).forEach(key => {
            let matcher = new RegExp(`${parameter || method}Response`, 'g');
            if (matcher.test(key)) {
              status = json_body[key][0]['WSResponse'][0]['status'][0];
              message = json_body[key][0]['WSResponse'][0]['message'][0];
              json_response = json_body[key][0];
            }
          });

          status = status['_'] || status;
          message = message['_'] || message;
        }
      } catch (err) {
        return reject("Error on creating contract");
      }

      if (!status) {
        return reject("NO_STATUS");
      }

      if (status.toUpperCase() !== 'OK') {
        return reject(message);
      }

      return resolve(json_response);
    });
  });
};

const format = (tag, value, includeXMLNS) => {
  if (value === null || value === '' || value === undefined) {
    if (includeXMLNS)
      return `<${tag} xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>`;
    return `<${tag} xsi:nil="true"/>`;
  } else {
    if (typeof value === 'boolean')
      value = (value === true ? 1 : 0);

    return `<${tag}>${value}</${tag}>`;
  }
};

module.exports = {
  wsPrint: async (id) => {
    try {
      let res = await wsRequest('Printing', `<id>${id}</id>`);
      return res;
    } catch (err) {
      throw err
    }
  },

  wsDocOut: async (id) => {
    try {
      let res = await wsRequest('DocOut', `<id>${id}</id>`);
      let documents = [];

      // console.log('docs: ', JSON.stringify(res['WSDocuments'][0]));

      for (let doc of res['WSDocuments'][0]['WSDocument']) {
        documents.push({
          doc: doc['doc'][0]['_'] || doc['doc'][0],
          nume_doc: doc['nume_doc'][0]['_'] || doc['nume_doc'][0],
          tip_doc: doc['tip_doc'][0]['_'] || doc['tip_doc'][0]
        });
      }

      return documents;
    } catch (err) {
      throw err
    }
  },

  wsDocIn: async (id, docs) => {
    let xmldocs = '';
    for (let doc of docs) {
      xmldocs += `<WSDocument>
                <doc>${doc.doc}</doc>
                <nume_doc>${doc.nume_doc}</nume_doc>
                <tip_doc>${doc.tip_doc}</tip_doc>
            </WSDocument>`;
    }

    console.log('>>>>>>>>>>>>>>>>>>>>DOC IN ID: ', id);
    try {
      let res = await wsRequest('DocIn', `<id>${id}</id><WSDocuments>${xmldocs}</WSDocuments>`);
      return res;
    } catch (err) {
      throw err;
    }
  },

  wsAccept: async (id, accepted, canal_sms, canal_email) => {
    try {
      let res = await wsRequest('Accept', `<id>${id}</id><accept>${accepted ? 'D' : 'N'}</accept><canal_email>${canal_email}</canal_email><canal_sms>${canal_sms}</canal_sms>`);
      return res;
    } catch (err) {
      throw err;
    }
  },

  wsOferta: async (data, docs) => {
    try {
      let xml = createOfferRequestXML(data, docs);
      let res = await wsRequest('Oferta', xml);
      return {
        dossierID: res['dossierId'][0]['_'] || res['dossierId'][0],
        opportunityID: res['opportunityId'][0]['_'] || res['opportunityId'][0]
      };
    } catch (err) {
      throw err;
    }
  },

  wsGetDiscounts: async (data) => {
    let xml = `
${format('denumire', data.denumire)}
${format('tip', data.tip)}
${format('seg', data.seg)}
${format('canal', data.canal)}
${format('judet', data.judet)}
${format('cityId', data.cityId)}
${format('scadenta', data.scadenta)}
${format('PenaltyAndGracePeriod', data.PenaltyAndGracePeriod, true)}
${format('POD', data.POD)}
${format('CNP', data.CNP)}
${format('serviciu', data.serviciu)}
${format('sw_titular', data.sw_titular)}
${format('sw_furnizor', data.sw_furnizor)}
${format('furnizare', data.furnizare)}
`;

    let res = await wsRequest('Discounts', xml, 'Discount');

    let discounts = [];
    for (const _discount of res.Discounts) {
      if (!_discount.Discount || !_discount.Discount[0])
        continue;

      let discount = _discount.Discount[0];
      discounts.push({
        DiscountID: discount.DiscountID[0]['_'],
        DiscountName: discount.DiscountName[0]['_'],
        Description: discount.Description[0]['_'],
        DiscountStartDate: discount.DiscountStartDate[0]['_'],
        DiscountEndDate: discount.DiscountEndDate[0]['_']
      });
    }

    return discounts;
  },

  wsGetReqDocList: async (id) => {
    let res = await wsRequest('GetRequiredDocList', `<DossierID>${id}</DossierID>`);
    return res;
  },

  wsGetProductsCartCheckout: async (varPretID, opportunityID, itemCode, sessionID) => {
    const body = `<id_varianta_pret>${varPretID}</id_varianta_pret>
      <opportunityId>${opportunityID}</opportunityId>
      <itemCode>${itemCode}</itemCode>
      <sessionId>${sessionID}</sessionId>`;

    // console.log('>>>CART: ', body);
    try {
      const res = await wsRequest('ProductsCartCheckout', body);

      return res;
    } catch (err) {
      throw err
    }
  },

  createOfferRequestXML: createOfferRequestXML
};

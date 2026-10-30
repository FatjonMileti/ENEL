const moment = require("moment");
const { USER_TYPE, USER_ROLE } = require("../../utils/enums.js");
const { trim } = require("../../utils/common.js");

const parsePostalCode = async (codPostalService, code, streetId) => {
  if (!code || code === "") {
    if (!streetId) return "000000";

    let coduri = (
      await codPostalService.find({ query: { strada_id: streetId } })
    ).data;
    if (coduri && coduri.length > 0) {
      let cod = coduri[0].cod_postal;
      return cod;
    } else return "000000";
  }

  return code;
};

const MAX_APARTMENT_LENGTH = 15;
const MAX_STREET_LENGTH = 15;
const MAX_SERIE_CI_LENGTH = 15;
const MAX_NR_CONTRACT_LENGTH = 15;
const B2B = "b2b";

const limitLength = (value, maxLength) => {
  if (value && value.toString) return value.toString().substring(0, maxLength);
  return "";
};

module.exports = async (app, session, type, user) => {
  const getField = (field) => {
    return session[`${type.toLowerCase()}_${field}`];
  };

  let codPostalService = app.service("cod-postal");

  let defaults = {
    Oferta: {
      id_fsd: null,
      generic_dossier_id: null,
      serviciu: null,
      sw_titular: null,
      sw_furnizor: null,
      furnizare: null,
      id_varianta_pret: null,
      sessionId: null,
      itemCode: null,
      furnizor: null,
      tip_contract: null,
      data_accept: null,
      valabil_de_la: null,
      valabil_furnizare: null,
      tip_canal: null,
      canal: null,
      kam: null,
      cu_avans: null,
      ritmfact_cod: null,
      nume_agent: null,
      marca_agent: null,
      consumptionConventions: null,
    },
    Negociere: {
      furn_24: null,
      verde: null,
      scadenta: null,
      pret_ea: null,
      pret_eaz: null,
      pret_eano: null,
      pret_eanw: null,
      pret_gaz: null,
      pret_tr_gaz: null,
    },
    ClientOferta: {
      nume_companie: null,
      nume: null,
      prenume: null,
      cnp_cui: null,
      strada: null,
      localitate: null,
      tip_artera: null,
      nume_strada: null,
      cod_postal: null,
      nr_strada: null,
      bloc: null,
      scara: null,
      apartament: null,
      etaj: null,
      rest_adresa: null,
      mobil: null,
      telefon: null,
      fax: null,
      email: null,
      MobileValidated: null,
      MobileValidationDate: null,
      EmailValidated: null,
      EmailValidationDate: null,
      ci_numar: null,
      ci_emis_de: null,
      ci_emis_la: null,
      ci_seria: null,
      cod_fiscal: null,
      cod_onrc: null,
      update_cros: null,
      transmitere_contract: null,
      tip_companie: null,
      nume_contact: null,
      prenume_contact: null,
      rol_contact: null,
      cnp_contact: null,
      telefon_contact: null,
      email_contact: null,
    },
    ModTransmitere: {
      canal_sms: false,
      sms: null,
      canal_email: false,
      email: null,
    },
    Concursuri: [
      {
        id: null,
        acord_concurs: null,
      },
    ],
    Interlocutor: {
      nume: null,
      pree: null,
      rol: null,
      mobil: null,
      telefon: null,
      fax: null,
      email: null,
      mobile_validat: false,
      email_validat: false,
    },
    Corespondenta: {
      localitate: null,
      tip_artera: null,
      nume_strada: null,
      strada: null,
      nr_strada: null,
      bloc: null,
      scara: null,
      apartament: null,
      etaj: null,
    },
    Conturi: [
      {
        banca: null,
        iban: null,
      },
    ],
    Locuri: [
      {
        nlc: null,
        eneltel: null,
        denumire_loc: null,
        localitate: null,
        tip_artera: null,
        nume_strada: null,
        strada: null,
        nr_strada: null,
        bloc: null,
        scara: null,
        apartament: null,
        etaj: null,
        cod_caen: null, //default value PPC-326
        nr_atr: null,
        data_atr: null,
        nivel_tensiune: null,
        pressure: null,
        presureLevel: null,
        putere: null,
        categorie_gaz: null,
        distribuitor: null,
        valabil_act_spatiu: null,
        necesar_pif: null,
      },
    ],
    ConsumuriLoc: [
      {
        nlc: null,
        marime_masurata: null,
        consum_lunar: null,
        consum_anual: null,
        consum_01: null,
        consum_02: null,
        consum_03: null,
        consum_04: null,
        consum_05: null,
        consum_06: null,
        consum_07: null,
        consum_08: null,
        consum_09: null,
        consum_10: null,
        consum_11: null,
        consum_12: null,
      },
    ],
    Semnaturi: [
      {
        client: null,
        functia: null,
        nume: null,
      },
      {
        client: null,
        functia: null,
        nume: null,
      },
    ],
    CFEE: {
      acord: null,
      mod_corespondenta: null,
      email: null,
      nr_telefon: null,
      mod_avans: null,
      iban: null,
      eneltel: null,
    },
    GDPR: {
      acord_mk: null,
      acord_part: null,
      acord_profil: null,
      canal_email: null,
      email: null,
      canal_sms: null,
      sms: null,
      canal_telefon: null,
      telefon: null,
      canal_posta: null,
      localitate: null,
      tip_artera: null,
      nume_strada: null,
      strada: null,
      nr_strada: null,
      bloc: null,
      scara: null,
      apartament: null,
      etaj: null,
    },
    SWFurnizor: {
      furnizor: null,
      nr_contract: null,
      data_contract: null,
      sold: null,
      index_contor: null,
      serie_contor: null,
      data_reziliere: null,
    },
    SWTitular: {
      data_act_spatiu: null,
      nr_act_spatiu: null,
      nume_fost_proprietar: null,
      declaratie_act_proprietar: null,
      ownership_role: null,
      ownership_role_desc: null,
      ownership_role_start_date: null,
    },
    Discounts: [],
    Readings: {
      GAS: null,
      ELE_SINGLERATE: null,
      ELE_DAY: null,
      ELE_NIGHT: null,
      ELE_GOAL: null,
      ELE_INDUCTIVE: null,
      ELE_CAPACITIVE: null,
      METER_NUMBER: null,
    },
    Voucher: {
      voucherId: null,
      isFriend: null,
      eneltelFriend: null,
    },
  };

  let data_act_spatiu;
  if (!getField("loc").declaratie_act_spatiu) {
    if (
      getField("loc_doc").valabilitate &&
      getField("loc_doc").valabilitate.toLowerCase() !== "invalid date"
    ) {
      data_act_spatiu = getField("loc").ownership_valabilitate;
    } else {
      data_act_spatiu = null;
    }
  } else {
    if (
      getField("loc").ownership_valabilitate &&
      getField("loc").ownership_valabilitate.toLowerCase() !== "invalid date"
    ) {
      data_act_spatiu = getField("loc").ownership_valabilitate;
    } else {
      data_act_spatiu = null;
    }
  }

  if (
    getField("loc")?.hotarare_judecatoreasca &&
    getField("loc").ownership_valabilitate.toLowerCase() !== "invalid date"
  ) {
    data_act_spatiu = getField("loc").ownership_valabilitate;
  }

  const SWTitular = {
    data_act_spatiu: data_act_spatiu
      ? moment(data_act_spatiu).format("YYYY-MM-DD")
      : "",
    nr_act_spatiu: getField("loc_doc").nr,
    nume_fost_proprietar: getField("loc").fost_proprietar,
    declaratie_act_proprietar: getField("loc").declaratie_act_spatiu,
    ownership_role: getField("loc").ownership_role,
    ownership_role_desc: getField("loc").ownership_role_desc,
    ownership_role_start_date: getField("loc").ownership_role_start_date
      ? moment(
        "01/" + getField("loc").ownership_role_start_date,
        "DD/MM/YYYY",
      ).format("YYYY-MM-DD")
      : "",
  };

  if (getField("loc")?.hotarare_judecatoreasca) {
    SWTitular.data_act_spatiu = null;
    SWTitular.nr_act_spatiu = null;
    SWTitular.nume_fost_proprietar = null;
    SWTitular.declaratie_act_proprietar = false;
    SWTitular.ownership_role = null;
    SWTitular.ownership_role_desc = null;
    SWTitular.ownership_role_start_date = null;
  }

  let data_index = moment(getField("loc").data_index);

  // configurare canale parteneri punct enel
  let tip_canal = 2;
  if (user.type == USER_TYPE.CALLCENTER) {
    tip_canal = 4;
  } else if (
    user.type === USER_TYPE.OFFICER &&
    (user.employed || user.role === USER_ROLE.AGENT)
  ) {
    tip_canal = 3;
  } else if (user.type === USER_TYPE.INFOKIOSK && user.employed) {
    tip_canal = 5;
  } else if (user.type === USER_TYPE.WEB) {
    tip_canal = 6;
  } else if (
    (user.type === USER_TYPE.AGENT && user.employed) ||
    user.type === USER_TYPE.LOWINVEST
  ) {
    tip_canal = 9;
  }

  let nr_atr = null;

  if (tip_canal === 2) {
    if (session.client_app === process.env.TELESALES_AGENT_APP) {
      nr_atr = "Telesales";
    } else if (session.client_app === process.env.ANDROID_APP1) {
      nr_atr = "D2D";
    }
  }

  const furnizor_data_start = moment(getField("furnizor_data_start"));

  const validated_by_phone =
    session?.contract_type === "b2c"
      ? session.client.validated_by_phone
      : session.company.data.validated_by_phone;
  const validated_by_email =
    session?.contract_type === "b2c"
      ? session.client.validated_by_email
      : session.company.data.validated_by_email;

  let req = {
    Oferta: {
      id_fsd: session.id,
      generic_dossier_id: session.generic_dossier_id,
      serviciu: type,
      sw_titular: getField("schimba_titular"),
      sw_furnizor: getField("schimba_furnizor"),
      furnizare: getField("are_furnizare_activa"),
      id_varianta_pret: getField('serviciu').cod,
      itemCode: getField("serviciu").itemCode,
      sessionId: getField("serviciu").sessionId,
      furnizor: getField("furnizor_viitor"),
      tip_contract: session.contract_type === B2B ? "NONCAS" : "CAS",
      data_accept: moment().format("YYYY-MM-DD"),
      valabil_de_la:
        furnizor_data_start.isBetween("2022-03-15", "2022-03-20", "day") &&
          getField("are_furnizare_activa") &&
          getField("schimba_furnizor") &&
          !getField("schimba_titular")
          ? "2022-03-20"
          : furnizor_data_start.format("YYYY-MM-DD"),
      valabil_furnizare: moment(getField("furnizor_data_start"))
        .add(session.perioada_furnizare, "month")
        .format("YYYY-MM-DD"),
      tip_canal: tip_canal,
      canal: user.companyId,
      kam: "CUCA",
      cu_avans: getField("factura").cu_avans,
      ritmfact_cod: getField("factura").ritm,
      nume_agent: `${user.firstName} ${user.lastName}`,
      marca_agent: user.marca,
      consumptionConventions: getField("loc").consum_conventie,
    },
    Negociere: {
      furn_24: session.perioada_furnizare == 24 ? true : false,
      verde: getField("serviciu").verde,
      scadenta: session.scadenta_factura,
      pret_ea: getField("serviciu").pret_ea,
      pret_eaz: getField("serviciu").pret_eaz,
      pret_eano: getField("serviciu").pret_eano,
      pret_eanw: getField("serviciu").pret_eanw,
      pret_gaz: getField("serviciu").pret_gaz,
      pret_tr_gaz: getField("serviciu").pret_tr_gaz,
    },
    ClientOferta: {
      nume_companie:
        session.company && session.company.data && session.company.data.nume,
      nume: session.client.nume,
      prenume: session.client.prenume,
      cnp_cui:
        session.contract_type === B2B
          ? session.company && session.company.data && session.company.data.cui
          : session.client.cnp,
      strada:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.strada
          : session.client.strada,
      localitate:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.localitate
          : session.client.localitate,
      tip_artera:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.tip_artera
          : session.client.tip_artera,
      nume_strada:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.nume_strada
          : session.client.nume_strada,
      cod_postal:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          (await parsePostalCode(
            codPostalService,
            session.company.address.cod_postal,
            session.company.address.strada,
          ))
          : await parsePostalCode(
            codPostalService,
            session.client.cod_postal,
            session.client.strada,
          ),
      nr_strada:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          limitLength(session.company.address.nr_strada, MAX_STREET_LENGTH)
          : limitLength(session.client.nr_strada, MAX_STREET_LENGTH),
      bloc:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.bloc
          : session.client.bloc,
      scara:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.scara
          : session.client.scara,
      apartament:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          limitLength(
            session.company.address.apartament,
            MAX_APARTMENT_LENGTH,
          )
          : limitLength(session.client.apartament, MAX_APARTMENT_LENGTH),
      etaj:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.etaj
          : session.client.etaj,
      rest_adresa:
        session.contract_type === B2B
          ? session.company &&
          session.company.address &&
          session.company.address.rest_adresa
          : session.client.rest_adresa,
      mobil:
        session.contract_type === B2B
          ? session.company &&
          session.company.data &&
          session.company.data.telefon_mobil
          : session.client.telefon_mobil,
      telefon: session.client.telefon_fix,
      fax: session.client.fax,
      email:
        session.contract_type === B2B
          ? session.company &&
          session.company.data &&
          session.company.data.email
          : session.client.email,
      MobileValidated: validated_by_phone || false,
      MobileValidationDate: null,
      EmailValidated: validated_by_email || false,
      EmailValidationDate: null,
      ci_numar: session.client.ci_numar,
      ci_emis_de: session.client.ci_emis_de,
      ci_emis_la: session.client.ci_emis_la,
      ci_seria: limitLength(session.client.ci_serie, MAX_SERIE_CI_LENGTH),
      cod_fiscal: "",
      cod_onrc:
        session.company &&
        session.company.data &&
        session.company.data.cod_onrc,
      update_cros: session.client_update_cross,
      transmitere_contract: !session.backoffice,
      tip_companie:
        session.company &&
        session.company.data &&
        session.company.data.tip_companie,
      cod_caen_companie:
        session.company &&
        session.company.data &&
        session.company.data.cod_caen,
      nume_contact:
        session.company &&
        session.company.legal_representative &&
        session.company.legal_representative.nume,
      prenume_contact:
        session.company &&
        session.company.legal_representative &&
        session.company.legal_representative.prenume,
      rol_contact:
        session.company &&
        session.company.legal_representative &&
        session.company.legal_representative.rol,
      cnp_contact:
        session.company &&
        session.company.legal_representative &&
        session.company.legal_representative.cnp,
      telefon_contact:
        session.company &&
        session.company.legal_representative &&
        session.company.legal_representative.telefon_mobil,
      email_contact:
        session.company &&
        session.company.legal_representative &&
        session.company.legal_representative.email,
    },
    ModTransmitere: {
      canal_sms: !!getField("contact").telefon,
      sms: getField("contact").telefon,
      canal_email: !!getField("contact").email,
      email: getField("contact").email,
    },
    Concursuri: getField("contact").concursuri || [],
    Discounts: getField("contact").discounts || [],
    Interlocutor: {
      nume: session.client.interlocutor_nume,
      pree: session.client.interlocutor_prenume,
      rol: session.client.interlocutor_rol,
      mobil: session.client.interlocutor_mobil,
      telefon: session.client.interlocutor_telefon,
      fax: session.client.interlocutor_fax,
      email: session.client.interlocutor_email,
      mobile_validat: validated_by_phone || false,
      email_validat: validated_by_email || false,
    },
    Corespondenta: {
      localitate: getField("factura").localitate,
      tip_artera: getField("factura").tip_artera,
      nume_strada: getField("factura").nume_strada,
      strada: getField("factura").strada,
      nr_strada: limitLength(getField("factura").nr_strada, MAX_STREET_LENGTH),
      bloc: getField("factura").bloc,
      scara: getField("factura").scara,
      apartament: limitLength(
        getField("factura").apartament,
        MAX_APARTMENT_LENGTH,
      ),
      etaj: getField("factura").etaj,
    },
    Conturi: [
      {
        banca: getField("factura").banca,
        iban: getField("factura").iban,
      },
    ],
    Locuri: [
      {
        nlc: trim(getField("loc").nlc),
        eneltel: getField("loc").eneltel,
        denumire_loc: getField("are_furnizare_activa")
          ? getField("loc").nlcInfo && getField("loc").nlcInfo.denumire_lc
          : session.contract_type === B2B
            ? "sediu"
            : "LOCUINTA",
        localitate: getField("loc").localitate,
        tip_artera: getField("loc").tip_artera,
        nume_strada: getField("loc").nume_strada,
        strada: getField("loc").strada,
        nr_strada: limitLength(getField("loc").nr_strada, MAX_STREET_LENGTH),
        bloc: getField("loc").bloc,
        scara: getField("loc").scara,
        apartament: limitLength(
          getField("loc").apartament,
          MAX_APARTMENT_LENGTH,
        ),
        etaj: getField("loc").etaj,
        cod_caen: getField("are_furnizare_activa")
          ? getField("loc").nlcInfo && getField("loc").nlcInfo.caen
          : session.contract_type === B2B &&
          session.company &&
          session.company.data &&
          session.company.data.cod_caen,
        nr_atr: nr_atr,
        data_atr: null,
        nivel_tensiune: getField("loc").nivel_tensiune,
        pressure: getField("loc").pressure,
        presureLevel: getField("loc").presureLevel,
        putere: getField("loc").putere,
        categorie_gaz: type === "EE" ? "" : getField("loc").categorie,
        distribuitor: getField("loc").distribuitor_id,
        valabil_act_spatiu: data_act_spatiu
          ? moment(data_act_spatiu).format("YYYY-MM-DD")
          : "",
        necesar_pif: getField("loc").necesar_pif,
        cod_pod: trim(getField("loc").cod_pod),
      },
    ],
    ConsumuriLoc: [],
    Semnaturi: [
      {
        client: 1,
        functia: "Client",
        nume:
          [session?.client?.nume, session?.client?.prenume]
            .filter(Boolean)
            .join(" ") || "",
      },
      {
        client: 0,
        functia: "Agent",
        nume: user.lastName + " " + user.firstName,
      },
    ],
    CFEE: {
      acord: true,
      mod_corespondenta: getField("factura").mod_corespondenta,
      email: getField("factura").email,
      nr_telefon: getField("factura").telefon_mobil,
      mod_avans: getField("factura").avans,
      iban: getField("factura").iban,
      eneltel: getField("loc").eneltel,
    },
    GDPR: {
      acord_mk: getField("contact").acord_mk,
      acord_part: getField("contact").acord_part,
      acord_profil: getField("contact").acord_profil,
      canal_email: getField("contact").canal_email,
      email: getField("contact").canal_email_text,
      canal_sms: getField("contact").canal_sms,
      sms: getField("contact").canal_sms_text,
      canal_telefon: getField("contact").canal_telefon,
      telefon: getField("contact").canal_telefon_text,
      canal_posta: getField("contact").canal_posta,
      localitate: getField("contact").canal_posta
        ? getField("factura").localitate
        : getField("contact").canal_posta_adresa.localitate,
      tip_artera: getField("contact").canal_posta
        ? getField("factura").tip_artera
        : getField("contact").canal_posta_adresa.tip_artera,
      nume_strada: getField("contact").canal_posta
        ? getField("factura").nume_strada
        : getField("contact").canal_posta_adresa.nume_strada,
      strada: getField("contact").canal_posta
        ? getField("factura").strada
        : getField("contact").canal_posta_adresa.strada,
      nr_strada: getField("contact").canal_posta
        ? limitLength(getField("factura").nr_strada, MAX_STREET_LENGTH)
        : limitLength(
          getField("contact").canal_posta_adresa.nr_strada,
          MAX_STREET_LENGTH,
        ),
      bloc: getField("contact").canal_posta
        ? getField("factura").bloc
        : getField("contact").canal_posta_adresa.bloc,
      scara: getField("contact").canal_posta
        ? getField("factura").scara
        : getField("contact").canal_posta_adresa.scara,
      apartament: getField("contact").canal_posta
        ? limitLength(getField("factura").apartament, MAX_APARTMENT_LENGTH)
        : limitLength(
          getField("contact").canal_posta_adresa.apartament,
          MAX_APARTMENT_LENGTH,
        ),
      etaj: getField("contact").canal_posta
        ? getField("factura").etaj
        : getField("contact").canal_posta_adresa.etaj,
    },
    SWFurnizor: {
      furnizor: getField("loc").furnizor_id,
      nr_contract: limitLength(
        getField("loc").nr_contract_actual,
        MAX_NR_CONTRACT_LENGTH,
      ),
      data_contract: getField("loc").data_contract_actual,
      sold: getField("loc").sold,
      index_contor: getField("loc").index,
      serie_contor: getField("loc").serie_contor,
      data_reziliere: data_index.isValid()
        ? data_index.format("YYYY-MM-DD")
        : "",
    },
    SWTitular: { ...SWTitular },
    Readings: {
      GAS: session.measurement_indexes ? session.measurement_indexes.GAS : null,
      ELE_SINGLERATE: session.measurement_indexes
        ? session.measurement_indexes.ELE_SINGLERATE
        : null,
      ELE_DAY: session.measurement_indexes
        ? session.measurement_indexes.ELE_DAY
        : null,
      ELE_NIGHT: session.measurement_indexes
        ? session.measurement_indexes.ELE_NIGHT
        : null,
      ELE_GOAL: session.measurement_indexes
        ? session.measurement_indexes.ELE_GOAL
        : null,
      ELE_INDUCTIVE: session.measurement_indexes
        ? session.measurement_indexes.ELE_INDUCTIVE
        : null,
      ELE_CAPACITIVE: session.measurement_indexes
        ? session.measurement_indexes.ELE_CAPACITIVE
        : null,
      METER_NUMBER: session.measurement_indexes
        ? session.measurement_indexes.METER_NUMBER
        : null,
    },
    Voucher: {
      voucherId: session.voucher ? session.voucher.voucherCode : null,
      isFriend: session.voucher ? session.voucher.isFriend : null,
      eneltelFriend: session.voucher ? session.voucher.eneltel : null,
    },
  };

  let consum = getField("consum");
  if (!(consum instanceof Array)) consum = [consum];

  for (let c of consum) {
    if (c) {
      req.ConsumuriLoc.push({
        nlc: trim(getField("loc").nlc),
        marime_masurata: c.marime_masurata,
        consum_lunar: c.lunar,
        consum_anual: c.anual,
        consum_01: c.ian,
        consum_02: c.feb,
        consum_03: c.mar,
        consum_04: c.apr,
        consum_05: c.mai,
        consum_06: c.iun,
        consum_07: c.iul,
        consum_08: c.aug,
        consum_09: c.sep,
        consum_10: c.oct,
        consum_11: c.noi,
        consum_12: c.dec,
      });
    }
  }

  return Object.assign({}, defaults, req);
};

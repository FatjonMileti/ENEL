// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const session = sequelizeClient.define('session', {
    ee_last_page: { type: DataTypes.STRING(100), allowNull: true },
    gaz_last_page: { type: DataTypes.STRING(100), allowNull: true },

    type: { type: DataTypes.STRING(5), allowNull: true },

    //not to be mistaken with type above which is for 'ee' or 'gaz'
    contract_type: { type: DataTypes.STRING(5) },

    agent_id: { type: DataTypes.INTEGER, allowNull: true },
    client_app: { type: DataTypes.STRING, allowNull: true },
    company_id: { type: DataTypes.INTEGER, allowNull: true },
    token: { type: DataTypes.STRING, allowNull: true },
    //#region new session
    ocr_count: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    secret: { type: DataTypes.STRING, allowNull: false },
    is_closed: { type: DataTypes.BOOLEAN, allowNull: false },
    is_fast_flow: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    link_sent_date: { type: DataTypes.DATE, allowNull: true },
    signature_agree_date: { type: DataTypes.DATE, allowNull: true },
    client_upload_agree_date: { type: DataTypes.DATE, allowNull: true },

    nume: { type: DataTypes.STRING, allowNull: true },
    prenume: { type: DataTypes.STRING, allowNull: true },
    perioada_furnizare: { type: DataTypes.INTEGER, allowNull: true },
    judet: { type: DataTypes.STRING(255), allowNull: true },
    tip_client: { type: DataTypes.STRING, allowNull: true },
    scadenta_factura: { type: DataTypes.INTEGER, allowNull: true },
    //#endregion

    //#region session state
    //ee
    ee_offer_success: { type: DataTypes.BOOLEAN, allowNull: true },
    ee_offer_error: { type: DataTypes.JSON, allowNull: true },
    ee_offer_date: { type: DataTypes.DATE, allowNull: true },

    ee_offer_request: { type: DataTypes.JSON, allowNull: true },
    ee_offer_internal_id: { type: DataTypes.STRING, allowNull: true },
    ee_offer_opportunity_id: { type: DataTypes.STRING, allowNull: true },

    ee_sign_success: { type: DataTypes.BOOLEAN, allowNull: true },
    ee_sign_error: { type: DataTypes.JSON, allowNull: true },
    ee_sign_date: { type: DataTypes.DATE, allowNull: true },
    ee_sign_channel: { type: DataTypes.STRING, allowNull: true },

    ee_activate_success: { type: DataTypes.BOOLEAN, allowNull: true },
    ee_activate_error: { type: DataTypes.JSON, allowNull: true },
    ee_activate_date: { type: DataTypes.DATE, allowNull: true },

    ee_agree: { type: DataTypes.BOOLEAN, allowNull: true },

    //gaz
    gaz_offer_success: { type: DataTypes.BOOLEAN, allowNull: true },
    gaz_offer_error: { type: DataTypes.JSON, allowNull: true },
    gaz_offer_date: { type: DataTypes.DATE, allowNull: true },
    gaz_sign_channel: { type: DataTypes.STRING, allowNull: true },

    gaz_offer_request: { type: DataTypes.JSON, allowNull: true },
    gaz_offer_internal_id: { type: DataTypes.STRING, allowNull: true },
    gaz_offer_opportunity_id: { type: DataTypes.STRING, allowNull: true },

    gaz_sign_success: { type: DataTypes.BOOLEAN, allowNull: true },
    gaz_sign_error: { type: DataTypes.JSON, allowNull: true },
    gaz_sign_date: { type: DataTypes.DATE, allowNull: true },

    gaz_activate_success: { type: DataTypes.BOOLEAN, allowNull: true },
    gaz_activate_error: { type: DataTypes.JSON, allowNull: true },
    gaz_activate_date: { type: DataTypes.DATE, allowNull: true },

    gaz_agree: { type: DataTypes.BOOLEAN, allowNull: true },

    closed_date: { type: DataTypes.DATE, allowNull: true },
    //#endregion

    //#region documents
    ee_documents: { type: DataTypes.JSON, allowNull: true },
    gaz_documents: { type: DataTypes.JSON, allowNull: true },
    /*
    {
      "type": "CI",
      "ext": "jpg",
      "count": 1
    }
    */
    ee_generated_documents: { type: DataTypes.JSON, allowNull: true },
    gaz_generated_documents: { type: DataTypes.JSON, allowNull: true },
    //#endregion

    //#region offer/serviciu
    ee_serviciu: { type: DataTypes.JSON, allowNull: true },
    gaz_serviciu: { type: DataTypes.JSON, allowNull: true },
    ee_serviciu_pana_la: { type: DataTypes.DATE, allowNull: true },
    gaz_serviciu_pana_la: { type: DataTypes.DATE, allowNull: true },
    /*
    {
      "serviciu": "EE",
      "gama": null,
      "tip": "GAZ_REZ15",
      "seg": "REZIDENTIALI",
      "denumire": "PPC GAZ Rezidentiali 15% disc",
      "de_la": "2018-03-05",
      "la": "2019-06-30",
      "site": true,
      "cod": 3489203,
      "pret_ea": null,
      "pret_eaz": null,
      "pret_eanw": null,
      "pret_eano": null,
      "pret_gaz": "88",
      "pret_tr_gaz": "12",
      "abonament": "0.1",
      "pret_ea_n": null,
      "pret_eaz_n": null,
      "pret_eanw_n": null,
      "pret_eano_n": null,
      "pret_gaz_n": "0.084",
      "pret_tr_gaz_n": "0.012",
      "abonament_n": "0.1",
      "cfe": "false",
      "verde": "false",
      "descriere_prod": "descriere of  gaz pachet",
      "descriere_prod_l": "bla bla desc lunga ...gaz",
      "denumire_pachet": "Pachet Gaz si Electricitate",
      "descriere_pachet": "descriere scurta pachet gaz si elec",
      "descriere_pachet_l": "desc lunga"
    }
    */
    //#endregion

    //#region informatii furnizare
    //electricitate
    ee_schimba_furnizor: { type: DataTypes.BOOLEAN, allowNull: true },
    ee_are_furnizare_activa: { type: DataTypes.BOOLEAN, allowNull: true },
    ee_schimba_titular: { type: DataTypes.BOOLEAN, allowNull: true },
    //gaz
    gaz_schimba_furnizor: { type: DataTypes.BOOLEAN, allowNull: true },
    gaz_are_furnizare_activa: { type: DataTypes.BOOLEAN, allowNull: true },
    gaz_schimba_titular: { type: DataTypes.BOOLEAN, allowNull: true },
    //#endregion

    //#region identificare client
    client_update_cross: { type: DataTypes.BOOLEAN, allowNull: true },
    client: { type: DataTypes.JSON, allowNull: true },
    /*
    {
      "cnp": "1860327100139",
      "nume": "LUPU",
      "prenume": "ADRIAN",
      "ci_serie": "XZ",
      "ci_numar": "466948",
      "ci_emis_de": "SPCLEP DEVA",
      "ci_emis_la": "2011-12-19",

      "judet": "BUZAU",
      "localitate": "",
      "tip_artera": "",
      "nume_strada": "",
      "strada": 871082610,
      "nr_strada": "23",
      "bloc": "5",
      "scara": "A",
      "apartament": "77",
      "etaj": "1",
      "cod_postal": "330026",

      "rest_adresa": "",

      "telefon_fix": "",
      "telefon_mobil": "0769605848",
      "email": "dan.moldovan@ppcenergy.ro",
      "fax": "",
      "interlocutor_rol": "",
      "interlocutor_nume": "",
      "interlocutor_prenume": "",
      "interlocutor_telefon": "",
      "interlocutor_mobil": "",
      "interlocutor_fax": "",
      "interlocutor_email": ""
    }
    */
    //#endregion

    //#region identificare societate comerciala
    company: { type: DataTypes.JSONB, allowNull: true },
    /*
    {
      "cui": "1860327100139",
      "nume": "X",
      "telefon_mobile": "12414141",
      "email": "test@test.com",
      "cod_onrc": "",
      "cod_caen": "",
      "tip_societate": "",

       "judet": "BUZAU",
      "localitate": "",
      "tip_artera": "",
      "nume_strada": "",
      "strada": 871082610,
      "nr_strada": "23",
      "bloc": "5",
      "scara": "A",
      "apartament": "77",
      "etaj": "1",
      "cod_postal": "330026",

      "rest_adresa": "",
    }
    */
    //#endregion

    //#region loc / furnizor
    ee_loc: { type: DataTypes.JSON, allowNull: true },
    gaz_loc: { type: DataTypes.JSON, allowNull: true },
    resend_link_counter: { type: DataTypes.INTEGER, allowNull: true },
    //location_long: { type: DataTypes.FLOAT, allowNull: true },
    /*
    	"ee_loc": {
        "nlc": "RO001E141593749",
        "furnizor_id": 430069,
        "eneltel": "141593749",
        "categorie": null,
        "nivel_tensiune": "JT",
        "distribuitor_id": 3,
        "denumire": "locuinta,Ilfov,Dudu",

        "judet": "BUZAU",
        "localitate": "",
        "tip_artera": "",
        "nume_strada": "",
        "strada": 871082610,
        "nr_strada": "23",
        "bloc": "5",
        "scara": "A",
        "apartament": "77",
        "etaj": "1",
        "cod_postal": "330026",

        "fost_proprietar": "",

        "sold": "",
        "index": "",
        "data_index": "",
        "serie_contor": "",
        "nr_contract_actual": "",
        "data_contract_actual": ""
      },
      "gaz_loc": {
        "nlc": "RO001E141593749",
        "furnizor_id": 430069,
        "eneltel": null,
        "categorie": "B1",
        "nivel_tensiune": null,
        "distribuitor_id": 3,
        "denumire": "locuinta,Ilfov,Dudu",

        "judet": "BUZAU",
        "localitate": "",
        "tip_artera": "",
        "nume_strada": "",
        "strada": 871082610,
        "nr_strada": "23",
        "bloc": "5",
        "scara": "A",
        "apartament": "77",
        "etaj": "1",
        "cod_postal": "330026",

        "fost_proprietar": "Adrian Lupu",

        "sold": null,
        "index": "",
        "data_index": null,
        "serie_contor": "",
        "nr_contract_actual": "",
        "data_contract_actual": ""
      }
    */
    measurement_indexes: { type: DataTypes.JSONB, allowNull: true },
    /*
    "measurement_indexes": {
      "GAS": "",
      "ELE_SINGLERATE": "",
      "ELE_DAY": "",
      "ELE_NIGHT": "",
      "ELE_GOAL": "",
      "ELE_INDUCTIVE": "",
      "ELE_CAPACITIVE": "",
      "METER_NUMBER": ""
    }
    */
    //#endregion

    //#region loc documente
    ee_loc_doc: { type: DataTypes.JSON, allowNull: true },
    gaz_loc_doc: { type: DataTypes.JSON, allowNull: true },
    /*
    "ee_loc_doc": {
      "tip": "",
      "nr": "",
      "valabilitate": ""
    },
    "gaz_loc_doc": {
      "tip": "ACT_PROPRIETAR",
      "nr": "1234123",
      "valabilitate": "2018-04-23"
    }
    */
    //#endregion

    //#region optiuni contract furnizare
    ee_furnizor_viitor: { type: DataTypes.STRING, allowNull: true },
    ee_furnizor_data_start: { type: DataTypes.DATE, allowNull: true },

    gaz_furnizor_viitor: { type: DataTypes.STRING, allowNull: true },
    gaz_furnizor_data_start: { type: DataTypes.DATE, allowNull: true },

    ee_factura: { type: DataTypes.JSON, allowNull: true },
    gaz_factura: { type: DataTypes.JSON, allowNull: true },

    ee_consum: { type: DataTypes.JSON, allowNull: true },
    gaz_consum: { type: DataTypes.JSON, allowNull: true },
    /*
    "ee_furnizor_viitor": 1188333,
    "ee_furnizor_data_start": "2018-04-23",

    "gaz_furnizor_viitor": 1188333,
    "gaz_furnizor_data_start": "2018-04-23",

    "ee_factura": {
      "judet": "BUZAU",
      "localitate": "",
      "tip_artera": "",
      "nume_strada": "",
      "strada": 871082610,
      "nr_strada": "23",
      "bloc": "5",
      "scara": "A",
      "apartament": "77",
      "etaj": "1",
      "cod_postal": "330026",

      "email": "adrianvlupu@gmail.com",
      "ritm": "L",
      "avans": 'BANCA',
      "iban": "RO21INGB0000999907100933",
      "banca": "INGB"
    },
    "gaz_factura": {
      "judet": "BUZAU",
      "localitate": "",
      "tip_artera": "",
      "nume_strada": "",
      "strada": 871082610,
      "nr_strada": "23",
      "bloc": "5",
      "scara": "A",
      "apartament": "77",
      "etaj": "1",
      "cod_postal": "330026",

      "email": "adrianvlupu@gmail.com",
      "ritm": "L",
      "cu_avans": true,
      "iban": "RO21INGB0000999907100933",
      "banca": "INGB"
    },

    "ee_consum": {
    	"anual": 120,
    	"lunar": 10,
    	"ian": 10,
    	"feb": 10,
    	"mar": 10,
    	"apr": 10,
    	"mai": 10,
    	"iun": 10,
    	"iul": 10,
    	"aug": 10,
    	"sep": 10,
    	"oct": 10,
    	"noi": 10,
    	"dec": 10
    },
    "gaz_consum": {
    	"anual": 120,
    	"lunar": 10,
    	"ian": 10,
    	"feb": 10,
    	"mar": 10,
    	"apr": 10,
    	"mai": 10,
    	"iun": 10,
    	"iul": 10,
    	"aug": 10,
    	"sep": 10,
    	"oct": 10,
    	"noi": 10,
    	"dec": 10
    }
    */
    //#endregion

    backoffice: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    abandon_type: { type: DataTypes.STRING, allowNull: true },
    abandon_details: { type: DataTypes.TEXT, allowNull: true },
    abandon_type_updated_at: { type: DataTypes.DATE, allowNull: true },
    //#region contact
    ee_contact: { type: DataTypes.JSON, allowNull: true },
    gaz_contact: { type: DataTypes.JSON, allowNull: true },
    cron_rejection_date: { type: DataTypes.JSON, allowNull: true },
    generic_dossier_id: { type: DataTypes.STRING, allowNull: true },
    generic_dossier_name: { type: DataTypes.STRING, allowNull: true },
    reminders: { type: DataTypes.JSONB, allowNull: true },
    voucher: { type: DataTypes.JSONB, allowNull: true },
    ee_putere_avizata: { type: DataTypes.INTEGER, allowNull: true },
    /*
    "ee_contact": {
        "email": "adrianvlupu@gmail.com",
        "telefon": "0769605848",
        "acord_part": true,
        "acord_profil": true,
        "acord_mk": true,
        "canal_email": true,
        "canal_email_text": "adrianvlupu@gmail.com",
        "canal_sms": true,
        "canal_sms_text": "0769605848",
        "canal_telefon": true,
        "canal_telefon_text": "0769605848",
        "canal_posta": true,
        "canal_posta_adresa": {
            "judet": "BUZAU",
            "localitate": "",
            "tip_artera": "",
            "nume_strada": "",
            "strada": 871082610,
            "nr_strada": "23",
            "bloc": "5",
            "scara": "A",
            "apartament": "77",
            "etaj": "1",
            "cod_postal": "330026"
        }
    },
    "gaz_contact": {
        "email": "adrianvlupu@gmail.com",
        "telefon": "0769605848",
        "acord_part": true,
        "acord_profil": true,
        "acord_mk": true,
        "canal_email": true,
        "canal_email_text": "adrianvlupu@gmail.com",
        "canal_sms": true,
        "canal_sms_text": "0769605848",
        "canal_telefon": true,
        "canal_telefon_text": "0769605848",
        "canal_posta": true,
        "canal_posta_adresa": {
            "judet": "BUZAU",
            "localitate": "",
            "tip_artera": "",
            "nume_strada": "",
            "strada": 871082610,
            "nr_strada": "23",
            "bloc": "5",
            "scara": "A",
            "apartament": "77",
            "etaj": "1",
            "cod_postal": "330026"
        }
    },
    */
    //#endregion
  }, { hooks: { beforeCount(options) { options.raw = true; } } });

  // eslint-disable-next-line no-unused-vars
  session.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    session.belongsTo(models.users, { foreignKey: 'agent_id', targetKey: 'id', constraints: false, as: 'agent' });
  };

  return session;
};

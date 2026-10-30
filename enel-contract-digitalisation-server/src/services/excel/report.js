const moment = require('moment');

const accept = 'ACCEPT';

const refuz = 'REFUZ';

const EMAIL_VALIDATED = 'Email Validat';
const MOBILE_VALIDATED = 'Mobil Validat';
const PIN_SENT_VIA_EMAIL = 'PIN Transmis Email';
const PIN_SENT_VIA_SMS = 'PIN Transmis SMS';

const VALIDATED_YES = 'DA';
const VALIDATED_NO = 'NU';


const parseStatus = (session) => {
    if (session.type === 'EE') {
        if (session.ee_offer_success === false || session.ee_sign_success === false || session.ee_activate_success === false)
            return 'Error';
        if (session.ee_agree === true)
            return 'Activated';
        if (session.ee_agree === false)
            return 'Rejected';
        if (session.ee_sign_success === true)
            return 'Pending for activation';
    }
    if (session.type === 'GAZ') {
        if (session.gaz_offer_success === false || session.gaz_sign_success === false || session.gaz_activate_success === false)
            return 'Error';
        if (session.gaz_agree === true)
            return 'Activated';
        if (session.gaz_agree === false)
            return 'Rejected';
        if (session.gaz_sign_success === true)
            return 'Pending for activation';
    }
    if (session.type === 'COMBO') {
        if (session.ee_offer_success === false || session.ee_sign_success === false || session.ee_activate_success === false
            || session.gaz_offer_success === false || session.gaz_sign_success === false || session.gaz_activate_success === false)
            return 'Error';
        if (session.gaz_agree === true && session.ee_agree === true)
            return 'Activated';
        if (session.gaz_agree === false || session.ee_agree === false)
            return 'Rejected';
        if (session.gaz_sign_success === true || session.gaz_sign_success === true)
            return 'Pending for activation';
    }

    return 'Unfinished';
};

const parseAbandon = (session) => {
    if (session.abandon_type == 'REFUZ_ACORD_PRELUCRARE_DATE')
        return 'Clientul nu este de acord cu politica de prelucrare date personale';
    if (session.abandon_type == 'LIPSA_DOCUMENTE')
        return 'Clientul nu are actele necesare';
    if (session.abandon_type == 'ABANDON_CLIENT')
        return 'Clientul nu doreste sa finalizeze contractul';
    if (session.abandon_type == 'EROARE')
        return 'Eroare din aplicatie';
    if (session.abandon_type == 'ALTELE')
        return 'Alte motive';

    return session.abandon_type;
};

const strip = (str) => {
    return str.replace(/\"/g, '\'').replace((/  |\r\n|\n|\r|\t/gm), "", ' ');
};

const getUsage = (s, type, size) => {
    if (type == 'EE' && s.ee_consum && s.ee_consum.length) {
        const u = (s.ee_consum && s.ee_consum.find) ? s.ee_consum.find(item => item.marime_masurata == size) : null;
        if (u) return u.anual;
    } else if (type == 'GAZ' && s.gaz_consum) {
        if (s.gaz_consum.anual) {
            return s.gaz_consum.anual;
        } else if (s.gaz_consum.length) {
            return s.gaz_consum[0].anual || '';
        }
    }
    return '';
};

const getElectronicInvoiceAccept = (s, type, invoiceType) => {
    if (type == 'EE' && s.ee_factura && s.ee_factura.length) {
        const m = (s.ee_factura && s.ee_factura.find) ? s.ee_factura.find(item => item.mod_corespondenta == invoiceType) : null;
        if (m) return accept;
    } else if (type == 'GAZ' && s.gaz_factura && s.gaz_factura.length) {
        const m = (s.gaz_factura && s.gaz_factura.find) ? s.gaz_factura.find(item => item.mod_corespondenta == invoiceType) : null;
        if (m) return accept;
    }
    return refuz;
};

const getENELMarketingAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.acord_mk)
        return accept;
    else if (type == 'GAZ' && s.gaz_contact.acord_mk)
        return accept;
    return refuz;
};

const getPartnerMarketingAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.acord_part)
        return accept;
    else if (type == 'GAZ' && s.gaz_contact.acord_part)
        return accept;
    return refuz;
};

const getEmailAcceptForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_email)
        return accept;
    else if (type == 'GAZ' && s.gaz_contact.canal_email)
        return accept;
    return refuz;
};

const getEmailTextForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_email_text)
        return s.ee_contact.canal_email_text;
    else if (type == 'GAZ' && s.gaz_contact.canal_email_text)
        return s.gaz_contact.canal_email_text;
    return '';
};

const getPhoneAcceptForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_telefon)
        return accept;
    else if (type == 'GAZ' && s.gaz_contact.canal_telefon)
        return accept;
    return refuz;
};

const getPhoneTextForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_telefon_text)
        return ("'" + s.ee_contact.canal_telefon_text);
    else if (type == 'GAZ' && s.gaz_contact.canal_telefon_text)
        return ("'" + s.gaz_contact.canal_telefon_text);
    return '';
};

const getSMSAcceptForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_sms)
        return accept;
    else if (type == 'GAZ' && s.gaz_contact.canal_sms)
        return accept;
    return refuz;
};

const getSMSTextForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_sms_text)
        return ("'" + s.ee_contact.canal_sms_text);
    else if (type == 'GAZ' && s.gaz_contact.canal_sms_text)
        return ("'" + s.gaz_contact.canal_sms_text);
    return '';
};

const getPostaAcceptForAgreement = (type, s) => {
    if (type == 'EE' && s.ee_contact.canal_posta)
        return accept;
    else if (type == 'GAZ' && s.gaz_contact.canal_posta)
        return accept;
    return refuz;
};

const getAdresaPostaAcceptGDPR = (type, s, cities, streets) => {

    if (type == 'EE' && s.ee_contact.canal_posta_adresa && s.ee_contact.canal_posta_adresa.judet)
        return ('Jud:' + s.ee_contact.canal_posta_adresa.judet
            + ', Loc:' + getCity(s, cities, s.ee_contact.canal_posta_adresa.localitate)
            + ', Str:' + getStreetName(streets, s.ee_contact.canal_posta_adresa.strada)
            + ', Nr:' + s.ee_contact.canal_posta_adresa.nr_strada
            + ', Bl:' + s.ee_contact.canal_posta_adresa.bloc
            + ', Sc:' + s.ee_contact.canal_posta_adresa.scara
            + ', Et:' + s.ee_contact.canal_posta_adresa.etaj
            + ', Ap:' + s.ee_contact.canal_posta_adresa.apartament);
    else if (type == 'GAZ' && s.gaz_contact.canal_posta_adresa && s.gaz_contact.canal_posta_adresa.judet)
        return ('Jud:' + s.gaz_contact.canal_posta_adresa.judet
            + ', Loc:' + getCity(s, cities, s.gaz_contact.canal_posta_adresa.localitate)
            + ', Str:' + getStreetName(streets, s.gaz_contact.canal_posta_adresa.strada)
            + ', Nr:' + s.gaz_contact.canal_posta_adresa.nr_strada
            + ', Bl:' + s.gaz_contact.canal_posta_adresa.bloc
            + ', Sc:' + s.gaz_contact.canal_posta_adresa.scara
            + ', Et:' + s.gaz_contact.canal_posta_adresa.etaj
            + ', Ap:' + s.gaz_contact.canal_posta_adresa.apartament);
    else
        return 'Fara adresa';
};

const getTotalSteps = async (app, sessions) => {
    const steps = {};
    const limit = (await app.service('app-log').find({
        query: {
            sessionId: {$in: sessions.map(item => item.id)},
            $limit: 0,
        }
    })).total;

    const appLogs = (await app.service('app-log').find({
        query: {
            sessionId: {$in: sessions.map(item => item.id)},
            $sort: {createdAt: 1},
            $limit: limit,
        }
    })).data;

    for (let i = 0; i < appLogs.length; i++) {
        const appLog = appLogs[i];
        const sessionId = `_${appLog.sessionId}`;
        if (!steps[sessionId]) {
            steps[sessionId] = {};
        }
        steps[sessionId][appLog.page] = moment(appLog.createdAt).format('HH:mm DD.MM.YYYY');
    }
    return steps;
};

const getStep = (step, page) => {
    return step ? step[page] : '';
};

const getChannel = (session) => {
    if (session.client_app == process.env.ANDROID_APP1 || session.client_app == process.env.TELESALES_AGENT_APP) {
        const type = session['agent.type'];
        if (type == 'vi') return 'Partener';
        if (type == 'pe') return 'Punct PPC';
        if (type == 'ik') return 'Infokiosk';
        if (type == 'cc') return 'Call Center';
        //const role = session['agent.role'];
        //if (role == 'agent' || role == 'cm') return 'Telesales';
    } else if (session.client_app == process.env.WEB_APP) {
        return 'Fast Contract';
    }
    return '';
};

const getChannelType = (session) => {
    if (session.client_app === process.env.TELESALES_AGENT_APP) {
        return 'Telesales';
    } else if (session.client_app === process.env.ANDROID_APP1) {
        return session['agent.employed'] ? 'Shop' : 'D2D';
    }
    return '';
};


const getAgentRole = (session) => {
    switch (session['agent.role']) {
        case 'user':
            return 'Mobile app user';
        case 'manager':
            return 'Partner manager';
        case 'auditor':
            return 'PPC manager';
        case 'agent':
            return 'Telesaler';
        case 'admin':
            return 'Admin';
        case 'cm':
            return 'Telesales Team Leader';
        case 'la':
            return 'Leads Admin';
        case 'lsa':
            return 'Leads Sales Admin';
        case 'lra':
            return 'Leads Reports Admin';
        case 'bum':
            return 'Business Unit Manager';
        default:
            return '';
    }
};

const getCity = (session, cities, postaCity) => {
    const {ee_loc, gaz_loc} = session;
    let cityId = null;
    if (ee_loc && ee_loc.localitate) {
        cityId = ee_loc.localitate;
    } else if (gaz_loc && gaz_loc.localitate) {
        cityId = gaz_loc.localitate;
    } else if (postaCity)
        cityId = postaCity;

    const city = cities.find(item => item.internal_id == cityId);
    return city ? city.denumire || '' : '';
};

const getStreetName = (streets, strada) => {
    const street = streets.find(item => item.internal_id == strada);
    return street ? street.denumire || '' : '';
};

const getDefaultReport = async (app, sessions) => {
    const cities = (await app.service('localitate').find({query: {$limit: 100000}})).data;

    let xls = [
        'FSD ID',
        'Type',
        'Status',
        'Internal Status',
        'Created At',
        'Updated At',
        'Marca Agent',
        'Rol Agent',
        'Agent ID',
        'Agent First Name',
        'Agent Last Name',
        'Channel',
        'D2D/Shop/Telesales',
        'Company ID',
        'Company Name',
        'POD',
        'NLC EE',
        'CLC',
        // 'CUI', // CUI
        // 'Representative name', // Representative name
        // 'CNP representative', // CNP representative
        // 'Representative phone number', // Representative phone number
        // 'Representative email address', // Representative email address
        'NLC GAZ',
        'OCR Count',
        'EE Last Page',
        'GAZ Last Page',
        'Delivery Period',
        'County',
        'City',
        'Client Type',
        'Invoice Overdue',
        'EE Service',
        'GAZ Service',
        'Active energy',
        'Active energy - day',
        'Active energy - night',
        'Active energy - night and weekend',
        'Gas', //'Gas transport', 'Daily subscription',
        'EE Digital Invoice',
        'EE Marketing Agreement',
        'EE Partner Agreement',
        'EE Offer Success',
        'EE Offer Cross ID',
        'EE Sign Success',
        'EE Activate Success',
        'EE Activation Agree',
        'GAZ Digital Invoice',
        'GAZ Marketing Agreement',
        'GAZ Partner Agreement',
        'GAZ Offer Success',
        'GAZ Offer Cross ID',
        'GAZ Sign Success',
        'GAZ Activate Success',
        'GAZ Activation Agree',
        'Cancel Reason',
        'Cancel Details',
        'SELECTARE OFERTA',
        'ACORD FURNIZARE DATE',
        'INFORMATII FURNIZARE',
        'FOTOGRAFIERE BULETIN',
        'VALIDARE CNP',
        'IDENTIFICARE CLIENT',
        'FOTO FACTURA',
        'VALIDARE LOC CONSUM',
        'IDENTIFICARE LOC CONSUM',
        'FOTO ACT SPATIU',
        'ADAUGARE ACT SPATIU',
        'OPTIUNI CONTRACTE FURNIZARE',
        'OPTIUNI COMUNICARE',
        'GENERARE DOCUMENTE',
        'REVIEW DOCUMENTE',
        'CONTRACTE REFUZATE',
        'CONTRACTE ACCEPTATE',
        'CONTRACTE PRINTALL',
        MOBILE_VALIDATED,
        EMAIL_VALIDATED,
        PIN_SENT_VIA_SMS,
        PIN_SENT_VIA_EMAIL,
    ].join('\t');

    let steps = await getTotalSteps(app, sessions);

    for (const s of sessions) {
        let ee_c = s.ee_contact;
        let gaz_c = s.gaz_contact;
        let ee_s = s.ee_serviciu;
        let gaz_s = s.gaz_serviciu;
        let ee_f = s.ee_factura;
        let gaz_f = s.gaz_factura;
        let ee_l = s.ee_loc;
        let gaz_l = s.gaz_loc;
        const validated_by_phone = s?.contract_type === 'b2c' ? s.client?.validated_by_phone : s.company?.data?.validated_by_phone;
        const validated_by_email = s?.contract_type === 'b2c' ? s.client?.validated_by_email : s.company?.data?.validated_by_email;

        xls += `\n${[
            s.id,
            s.type,
            parseStatus(s),
            s.status,
            moment(s.createdAt).format('HH:mm DD.MM.YYYY'),
            moment(s.updatedAt).format('HH:mm DD.MM.YYYY'),
            s['agent.marca'],
            getAgentRole(s),
            s.agent_id,
            s.client_app === process.env.WEB_APP ? 'web-client' : s['agent.firstName'].trim(),
            s['agent.lastName'] ? s['agent.lastName'].trim():s['agent.lastName'],
            getChannel(s),
            getChannelType(s),
            s['agent.canal.internal_id'],
            s['agent.canal.denumire'],
            (ee_l && ee_l.cod_pod) ? `'${ee_l.cod_pod.toString().replace('\t', '')}` : '',   // POD
            (ee_l && ee_l.nlc) ? ee_l.nlc.toString().replace('\t', '') : '',       // NLC GAZ
            (s.gaz_loc && s.gaz_loc.cod_pod) ? gaz_l.cod_pod.toString().replace('\t', '') : '', // CLC
            // (s.company) ? s.company.data ? s.company.data.cui ? s.company.data.cui : '' : '' : '', //CUI
            // ((s.company) ? s.company.legal_representative ? s.company.legal_representative.nume ? s.company.legal_representative.nume : '' : '' : '') + ((s.company) ? s.company.legal_representative ? s.company.legal_representative.prenume ? s.company.legal_representative.prenume : '' : '' : ''), // legal_representative name
            // (s.company) ? s.company.legal_representative ? s.company.legal_representative.cnp ? s.company.legal_representative.cnp : '' : '' : '', // CNP representative
            // (s.company) ? s.company.legal_representative ? s.company.legal_representative.telefon_mobil ? s.company.legal_representative.telefon_mobil : '' : '' : '', // CNP representative
            // (s.company) ? s.company.legal_representative ? s.company.legal_representative.email ? s.company.legal_representative.email : '' : '' : '', // CNP representative
            (s.gaz_loc && s.gaz_loc.nlc) ? gaz_l.nlc.toString().replace('\t', '') : '',     // NLC GAZ
            s.ocr_count,
            s.ee_last_page,
            s.gaz_last_page,
            s.perioada_furnizare,
            s.judet,
            getCity(s, cities),
            s.tip_client,
            s.scadenta_factura,
            ee_s ? ee_s.denumire || '' : '',
            gaz_s ? gaz_s.denumire || '' : '',
            ee_s ? ee_s.pret_ea_n ? `${ee_s.pret_ea_n} lei/kWh` : '' : '',
            ee_s ? ee_s.pret_eaz_n ? `${ee_s.pret_eaz_n} lei/kWh` : '' : '',
            ee_s ? ee_s.pret_eano_n ? `${ee_s.pret_eano_n} lei/kWh` : '' : '',
            ee_s ? ee_s.pret_eanw_n ? `${ee_s.pret_eanw_n} lei/kWh` : '' : '',
            ee_s ? ee_s.pret_gaz_n ? `${ee_s.pret_gaz_n} lei/kWh` : '' : '',
            (ee_f && ee_f.mod_corespondenta) ? (ee_f.mod_corespondenta == 'MAIL' ? 'true' : 'false') : '',
            ee_c ? (ee_c.acord_mk === false ? 'false' : ee_c.acord_mk === true ? 'true' : '') : '',
            ee_c ? (ee_c.acord_part === false ? 'false' : ee_c.acord_part === true ? 'true' : '') : '',
            s.ee_offer_success,
            s.ee_offer_internal_id,
            s.ee_sign_success,
            s.ee_activate_success,
            s.ee_agree,
            (gaz_f && gaz_f.mod_corespondenta) ? (gaz_f.mod_corespondenta == 'MAIL' ? 'true' : 'false') : '',
            gaz_c ? (gaz_c.acord_mk === false ? 'false' : gaz_c.acord_mk === true ? 'true' : '') : '',
            gaz_c ? (gaz_c.acord_part === false ? 'false' : gaz_c.acord_part === true ? 'true' : '') : '',
            s.gaz_offer_success, s.gaz_offer_internal_id, s.gaz_sign_success, s.gaz_activate_success, s.gaz_agree,
            parseAbandon(s),
            s.abandon_details,
            getStep(steps[`_${s.id}`], 'SELECTARE_OFERTA'),
            getStep(steps[`_${s.id}`], 'ACORD_FURNIZARE_DATE'),
            getStep(steps[`_${s.id}`], 'INFORMATII_FURNIZARE'),
            getStep(steps[`_${s.id}`], 'FOTOGRAFIERE_BULETIN'),
            getStep(steps[`_${s.id}`], 'VALIDARE_CNP'),
            getStep(steps[`_${s.id}`], 'IDENTIFICARE_CLIENT'),
            getStep(steps[`_${s.id}`], 'FOTO_FACTURA'),
            getStep(steps[`_${s.id}`], 'VALIDARE_LOC_CONSUM'),
            getStep(steps[`_${s.id}`], 'IDENTIFICARE_LOC_CONSUM'),
            getStep(steps[`_${s.id}`], 'FOTO_ACT_SPATIU'),
            getStep(steps[`_${s.id}`], 'ADAUGARE_ACT_SPATIU'),
            getStep(steps[`_${s.id}`], 'OPTIUNI_CONTRACTE_FURNIZARE'),
            getStep(steps[`_${s.id}`], 'OPTIUNI_COMUNICARE'),
            getStep(steps[`_${s.id}`], 'GENERARE_DOCUMENTE'),
            getStep(steps[`_${s.id}`], 'REVIEW_DOCUMENTE'),
            getStep(steps[`_${s.id}`], 'CONTRACTE_REFUZATE'),
            getStep(steps[`_${s.id}`], 'CONTRACTE_ACCEPTATE'),
            getStep(steps[`_${s.id}`], 'CONTRACTE_PRINTALL'),
            validated_by_phone ? VALIDATED_YES : VALIDATED_NO,
            validated_by_email ? VALIDATED_YES : VALIDATED_NO,
            validated_by_phone ? VALIDATED_YES : VALIDATED_NO,
            validated_by_email ? VALIDATED_YES : VALIDATED_NO
        ].join('\t')}`;
    }

    return xls;
};

const convertToExcelData = (value) => {
    if (Array.isArray(value)) {
        let data_arr = [];
        let returned_arr = [];
        value.forEach(item => {
            for (const [key, val] of Object.entries(item)) {
                let v = val;

                data_arr.push(`${key}=${v}`)
            }
            returned_arr.push(data_arr.map((item) => (item)).join(', '))
        });
        return returned_arr.map((item) => (item)).join(',,,');
    }

    return value;
};

const getReportForFsdAdmin = async (app, sessions) => {

    let xls = Object.keys(sessions[0]).join('\t');

    for (const s of sessions) {
        xls += `\n${[
            s.id,
            s.ee_last_page,
            s.gaz_last_page,
            s.type,
            s.contract_type,
            s.agent_id,
            s.client_app,
            s.company_id,
            s.token,
            s.ocr_count,
            s.status,
            s.secret,
            s.is_closed,
            s.is_fast_flow,
            s.link_sent_date,
            s.signature_agree_date,
            s.client_upload_agree_date,
            s.nume,
            s.prenume,
            s.perioada_furnizare,
            s.judet,
            s.tip_client,
            s.scadenta_factura,
            s.ee_offer_success,
            JSON.stringify(s.ee_offer_error),
            s.ee_offer_date,
            JSON.stringify(s.ee_offer_request),
            s.ee_offer_internal_id,
            s.ee_sign_success,
            JSON.stringify(s.ee_sign_error),
            s.ee_sign_date,
            s.ee_sign_channel,
            s.ee_activate_success,
            JSON.stringify(s.ee_activate_error),
            s.ee_activate_date,
            s.ee_agree,
            s.gaz_offer_success,
            JSON.stringify(s.gaz_offer_error),
            s.gaz_offer_date,
            JSON.stringify(s.gaz_sign_channel),
            JSON.stringify(s.gaz_offer_request),
            JSON.stringify(s.gaz_offer_internal_id),
            JSON.stringify(s.gaz_sign_success),
            JSON.stringify(s.gaz_sign_error),
            JSON.stringify(s.gaz_sign_date),
            JSON.stringify(s.gaz_activate_success),
            JSON.stringify(s.gaz_activate_error),
            JSON.stringify(s.gaz_activate_date),
            JSON.stringify(s.gaz_agree),
            JSON.stringify(s.closed_date),
            JSON.stringify(s.ee_documents),
            JSON.stringify(s.gaz_documents),
            JSON.stringify(s.ee_generated_documents),
            JSON.stringify(s.gaz_generated_documents),
            JSON.stringify(s.ee_serviciu),
            JSON.stringify(s.gaz_serviciu),
            JSON.stringify(s.ee_serviciu_pana_la),
            JSON.stringify(s.gaz_serviciu_pana_la),
            JSON.stringify(s.ee_schimba_furnizor),
            JSON.stringify(s.ee_are_furnizare_activa),
            JSON.stringify(s.ee_schimba_titular),
            JSON.stringify(s.gaz_schimba_furnizor),
            JSON.stringify(s.gaz_are_furnizare_activa),
            JSON.stringify(s.gaz_schimba_titular),
            JSON.stringify(s.client_update_cross),
            JSON.stringify(s.client),
            JSON.stringify(s.ee_loc),
            JSON.stringify(s.gaz_loc),
            JSON.stringify(s.resend_link_counter),
            JSON.stringify(s.ee_loc_doc),
            JSON.stringify(s.gaz_loc_doc),
            JSON.stringify(s.ee_furnizor_viitor),
            JSON.stringify(s.ee_furnizor_data_start),
            JSON.stringify(s.gaz_furnizor_viitor),
            JSON.stringify(s.gaz_furnizor_data_start),
            JSON.stringify(s.ee_factura),
            JSON.stringify(s.gaz_factura),
            JSON.stringify(s.ee_consum),
            JSON.stringify(s.gaz_consum),
            JSON.stringify(s.backoffice),
            JSON.stringify(s.abandon_type),
            JSON.stringify(s.abandon_details),
            JSON.stringify(s.ee_contact),
            JSON.stringify(s.gaz_contact),
            JSON.stringify(s.cron_rejection_date),
            JSON.stringify(s.reminders),
            s.createdAt,
            s.updatedAt,
        ].join('\t')}`;
    }

    return xls;
};

const getDetailedReport = async (app, sessions) => {
    const distributors = (await app.service('distribuitor').find({query: {$limit: 1000}})).data;
    const providers = (await app.service('furnizor').find({query: {$limit: 1000}})).data;
    const cities = (await app.service('localitate').find({query: {$limit: 100000}})).data;
    const streets = (await app.service('strada').find({query: {$limit: 100000}}));

    const getFields = (s, type) => {
        const d = distributors.find(item => {
            if (!item.internal_id || !s[`${type.toLowerCase()}_loc`]) return false;
            return item.internal_id == s[`${type.toLowerCase()}_loc`].distribuitor_id;
        });

        const p = providers.find(item => {
            if (!item.internal_id || !s[`${type.toLowerCase()}_furnizor_viitor`]) return false;
            return item.internal_id == s[`${type.toLowerCase()}_furnizor_viitor`];
        });

        const validated_by_phone = s?.contract_type === 'b2c' ? s.client?.validated_by_phone : s.company?.data?.validated_by_phone;
        const validated_by_email = s?.contract_type === 'b2c' ? s.client?.validated_by_email : s.company?.data?.validated_by_email;

        if (type == 'GAZ') {
            return [
                s.id,
                moment(s.createdAt).format('DD.MM.YYYY'),
                (s.client && s.client.telefon_fix) ? `'${s.client.telefon_fix}` : '',
                (s.client && s.client.telefon_mobil) ? `'${s.client.telefon_mobil}` : '',
                (s.client && s.client.email) ? `${s.client.email}` : '',
                (s.nume && s.prenume) ? `${s.nume} ${s.prenume}` : `${s.nume || ''}${s.prenume || ''}`,
                ((s.company) ? s.company.data ? s.company.data.nume ? s.company.data.nume : '' : '' : ''), //company name
                ((s.company) ? s.company.data ? s.company.data.cui ? s.company.data.cui : '' : '' : ''), //CUI
                (((s.company) ? s.company.legal_representative ? s.company.legal_representative.nume ? s.company.legal_representative.nume : '' : '' : '') + ((s.company) ? s.company.legal_representative ? s.company.legal_representative.prenume ? s.company.legal_representative.prenume : '' : '' : '')), // legal_representative name
               ( (s.company) ? s.company.legal_representative ? s.company.legal_representative.cnp ? s.company.legal_representative.cnp.toString() : '' : '' : ''), // CNP representative
                ((s.company) ? s.company.legal_representative ? s.company.legal_representative.telefon_mobil ? s.company.legal_representative.telefon_mobil.toString() : '' : '' : ''), // CNP representative
                ((s.company) ? s.company.legal_representative ? s.company.legal_representative.email ? s.company.legal_representative.email : '' : '' : ''), // CNP representative
                (s.client && s.client.cnp) ? `'${s.client.cnp}` : '',
                '',                                 // POD
                '',                                 // NLC EE
                (s.gaz_loc && s.gaz_loc.cod_pod) ? s.gaz_loc.cod_pod.toString().replace('\t', '') : '', // CLC
                (s.gaz_loc && s.gaz_loc.nlc) ? s.gaz_loc.nlc.toString().replace('\t', '') : '',     // NLC GAZ
                getUsage(s, 'GAZ'), // active usage
                '',                 // day usage
                '',                 // night usage
                '',                 // night and weekend usage
                p ? p.denumire : '',
                d ? d.denumire : '',
                s.judet,
                s.gaz_serviciu ? s.gaz_serviciu.denumire : '',
                s.tip_client,
                s.perioada_furnizare,
                (s.gaz_serviciu && s.gaz_serviciu.tip) ? `${s.gaz_serviciu.tip}` : '',
                '', // active price
                '', // day price
                '', // night price
                '', // night and weekend price
                (s.gaz_serviciu && s.gaz_serviciu.pret_gaz_n) ? `${s.gaz_serviciu.pret_gaz_n} lei/kWh` : '', // gas price                                                                                   // gaz
                s.gaz_offer_internal_id || '',
                moment(s.createdAt).format('DD.MM.YYYY'),
                s.gaz_furnizor_data_start ? moment(s.gaz_furnizor_data_start).format('DD.MM.YYYY') : '',
                s['agent.canal.denumire'],
                s['agent.marca'],
                getAgentRole(s),
                getChannel(s),
                getChannelType(s),
                parseStatus(s),
                s.client_app === process.env.WEB_APP ? 'web-client' : s['agent.firstName'].trim(),
                s['agent.lastName'] ? s['agent.lastName'].trim() : null,
                s.gaz_activate_date ? moment(s.gaz_activate_date).format('DD.MM.YYYY') : '',
                getElectronicInvoiceAccept(s, 'GAZ', 'MAIL'),
                getENELMarketingAgreement('GAZ', s),
                getPartnerMarketingAgreement('GAZ', s),
                getEmailAcceptForAgreement('GAZ', s),
                getEmailTextForAgreement('GAZ', s),
                getPhoneAcceptForAgreement('GAZ', s),
                getPhoneTextForAgreement('GAZ', s),
                getSMSAcceptForAgreement('GAZ', s),
                getSMSTextForAgreement('GAZ', s),
                getPostaAcceptForAgreement('GAZ', s),
                getAdresaPostaAcceptGDPR('GAZ', s, cities, streets),
                (s.gaz_contact && s.gaz_contact.email) ? accept : refuz,
                (s.gaz_contact && s.gaz_contact.email) ? s.gaz_contact.email : '',
                (s.gaz_contact && s.gaz_contact.telefon) ? accept : refuz,
                (s.gaz_contact && s.gaz_contact.telefon) ? ("'" + s.gaz_contact.telefon) : '',
                validated_by_phone ? VALIDATED_YES : VALIDATED_NO,
                validated_by_email ? VALIDATED_YES : VALIDATED_NO,
                validated_by_phone ? VALIDATED_YES : VALIDATED_NO,
                validated_by_email ? VALIDATED_YES : VALIDATED_NO
            ];
        }

        return [
            s.id,
            moment(s.createdAt).format('DD.MM.YYYY'),
            (s.client && s.client.telefon_fix) ? `'${s.client.telefon_fix}` : '',
            (s.client && s.client.telefon_mobil) ? `'${s.client.telefon_mobil}` : '',
            (s.client && s.client.email) ? `${s.client.email}` : '',
            (s.nume && s.prenume) ? `${s.nume} ${s.prenume}` : `${s.nume || ''}${s.prenume || ''}`,
            ((s.company) ? s.company.data ? s.company.data.nume ? s.company.data.nume : '' : '' : ''), //company name
            ((s.company) ? s.company.data ? s.company.data.cui ? s.company.data.cui : '' : '' : ''), //CUI
            (((s.company) ? s.company.legal_representative ? s.company.legal_representative.nume ? s.company.legal_representative.nume : '' : '' : '') + ((s.company) ? s.company.legal_representative ? s.company.legal_representative.prenume ? s.company.legal_representative.prenume : '' : '' : '')), // legal_representative name
            ((s.company) ? s.company.legal_representative ? s.company.legal_representative.cnp ? s.company.legal_representative.cnp.toString() : '' : '' : ''), // CNP representative
            ((s.company) ? s.company.legal_representative ? s.company.legal_representative.telefon_mobil ? s.company.legal_representative.telefon_mobil.toString() : '' : '' : ''), // CNP representative
            ((s.company) ? s.company.legal_representative ? s.company.legal_representative.email ? s.company.legal_representative.email : '' : '' : ''), // CNP representative

            (s.client && s.client.cnp) ? `'${s.client.cnp}` : '',
            (s.ee_loc && s.ee_loc.cod_pod) ? `'${s.ee_loc.cod_pod.toString().replace('\t', '')}` : '',   // POD
            (s.ee_loc && s.ee_loc.nlc) ? s.ee_loc.nlc.toString().replace('\t', '') : '',   // NLC EE
            '',                             // CLC
            '',                             // NLC GAZ
            getUsage(s, 'EE', 'EA'),    // active usage
            getUsage(s, 'EE', 'EAZ'),   // day usage
            getUsage(s, 'EE', 'EANO'),  // night usage
            getUsage(s, 'EE', 'EANW'),  // night and weekend usage
            p ? p.denumire : '',
            d ? d.denumire : '',
            s.judet,
            s.ee_serviciu ? s.ee_serviciu.denumire : '',
            s.tip_client,
            s.perioada_furnizare,
            (s.ee_serviciu && s.ee_serviciu.tip) ? `${s.ee_serviciu.tip}` : '',
            (s.ee_serviciu && s.ee_serviciu.pret_ea_n) ? `${s.ee_serviciu.pret_ea_n} lei/kWh` : '',     // active price
            (s.ee_serviciu && s.ee_serviciu.pret_eaz_n) ? `${s.ee_serviciu.pret_eaz_n} lei/kWh` : '',   // day price
            (s.ee_serviciu && s.ee_serviciu.pret_eano_n) ? `${s.ee_serviciu.pret_eano_n} lei/kWh` : '', // night price
            (s.ee_serviciu && s.ee_serviciu.pret_eanw_n) ? `${s.ee_serviciu.pret_eanw_n} lei/kWh` : '', // night and weekend price
            '',                                                                                         // gas price
            s.ee_offer_internal_id || '',
            moment(s.createdAt).format('DD.MM.YYYY'),
            s.ee_furnizor_data_start ? moment(s.ee_furnizor_data_start).format('DD.MM.YYYY') : '',
            s['agent.canal.denumire'],
            s['agent.marca'],
            getAgentRole(s),
            getChannel(s),
            getChannelType(s),
            parseStatus(s),
            s.client_app === process.env.WEB_APP ? 'web-client' : s['agent.firstName'].trim(),
            s['agent.lastName'] ? s['agent.lastName'].trim() : null,
            s.ee_activate_date ? moment(s.ee_activate_date).format('DD.MM.YYYY') : '',
            getElectronicInvoiceAccept(s, 'EE', 'MAIL'),
            getENELMarketingAgreement('EE', s),
            getPartnerMarketingAgreement('EE', s),
            getEmailAcceptForAgreement('EE', s),
            getEmailTextForAgreement('EE', s),
            getPhoneAcceptForAgreement('EE', s),
            getPhoneTextForAgreement('EE', s),
            getSMSAcceptForAgreement('EE', s),
            getSMSTextForAgreement('EE', s),
            getPostaAcceptForAgreement('EE', s),
            getAdresaPostaAcceptGDPR('EE', s, cities, streets),
            (s.ee_contact && s.ee_contact.email) ? accept : refuz,
            (s.ee_contact && s.ee_contact.email) ? s.ee_contact.email : '',
            (s.ee_contact && s.ee_contact.telefon) ? accept : refuz,
            (s.ee_contact && s.ee_contact.telefon) ? ("'" + s.ee_contact.telefon) : '',
            validated_by_phone ? VALIDATED_YES : VALIDATED_NO,
            validated_by_email ? VALIDATED_YES : VALIDATED_NO,
            validated_by_phone ? VALIDATED_YES : VALIDATED_NO,
            validated_by_email ? VALIDATED_YES : VALIDATED_NO
        ];
    };

    let xls = [
        'FSD ID',
        'Created At',
        'Telefon Client',
        'Mobile Client',
        'Email Client',
        'Nume client',
        'Company Name',
        'CUI',
        'Representative name', // Representative name
        'CNP representative', // CNP representative
        'Representative phone number', // Representative phone number
        'Representative email address', // Representative email address
        'CNP',
        'POD',
        'NLC EE',
        'CLC',
        'NLC GAZ',
        'Consum anual (kWh)',
        'Consum anual (kWh) - zi',
        'Consum anual (kWh) - noapte',
        'Consum anual (kWh) - noapte si weekend',
        'Furnizor actual',
        'Zona Distributie',
        'Judet',
        'Tip oferta',
        'Categorie client',
        'Furnizare 24 luni',
        'Tip oferta piata libera',
        'Pret acceptat/Pret furnizare negociat',
        'Pret acceptat/Pret furnizare negociat - zi',
        'Pret acceptat/Pret furnizare negociat - noapte',
        'Pret acceptat/Pret furnizare negociat - noapte si weekend',
        'Pret acceptat/Pret furnizare negociat - gaz',
        'Nr contract',
        'Data contract',
        'Data inceput furnizare',
        'Nume partener',
        'Marca Agent',
        'Rol Agent',
        'Canal',
        'D2D/Shop/Telesales',
        'Status',
        'Nume Agent',
        'Prenume Agent',
        'Data semnare contract',
        'Factura electronica',
        'Acord Mkting PPC',
        'Acord Mkting Partener',
        'Acord e-mail',
        'Adresa email GDPR',
        'Acord telefon',
        'Numar telefon GDPR',
        'Acord SMS',
        'Numar telefon SMS GDPR',
        'Acord Posta',
        'Adresa postala GDPR',
        'Modalitate transmitere contract email',
        'Adresa email transmitere contract',
        'Modalitate transmitere contract SMS',
        'Numar telefon transmitere contract SMS',
        MOBILE_VALIDATED,
        EMAIL_VALIDATED,
        PIN_SENT_VIA_SMS,
        PIN_SENT_VIA_EMAIL,
    ].join('\t');

    for (const s of sessions) {
        if (s.type == 'COMBO') {
            xls += `\n${getFields(s, 'EE').join('\t')}`;
            xls += `\n${getFields(s, 'GAZ').join('\t')}`;
        } else {
            xls += `\n${getFields(s, s.type || 'EE').join('\t')}`;
        }
    }

    return xls;
};

module.exports = {
    getDefaultReport,
    getDetailedReport,
    getReportForFsdAdmin
};

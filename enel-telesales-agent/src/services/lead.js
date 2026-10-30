import _ from 'lodash';

export const IMPORT_KEYS = ['internal_id', 'cnp', 'phone', 'pod'];
export const HEADER_KEY = 1;
export const LEAD_MAPPING = {
    fullName: 2,
    phone: 3,
    mobile: 4,
    email: 5,
    cnp: 6,
    county: 7,
    pod: 38,
    // expiry_date: 60,
    status: 62,
    channel: 63,
    source: 65,
    consumption: 66,
    // notes: 67,
    internal_id: 69,
};

const parseBoolean = value => {
    if (value) {
        if (
            value
                .toString()
                .toLowerCase()
                .match('no') ||
            value
                .toString()
                .toLowerCase()
                .match('nu')
        ) {
            return false;
        }
        if (value === '-') {
            return false;
        }
        return true;
    }
    return false;
};

export const LEAD_PARAMS = {
    fullName: { label: 'Nume' },
    phone: { label: 'Telefon' },
    mobile: { label: 'Telefon Mobil' },
    email: { label: 'Email' },
    cnp: { label: 'CNP' },

    county: { label: 'Judet' },
    localitate: { label: 'Localitate' },
    tip_artera: { label: 'Tip Strada' },
    strada: { label: 'Strada' },
    nr_strada: { label: 'Nr Strada' },
    bloc: { label: 'Bloc' },
    scara: { label: 'Scara' },
    etaj: { label: 'Etaj' },
    apartament: { label: 'Apartament' },

    ci_serie: { label: 'CI Serie' },
    ci_numar: { label: 'CI Numar' },
    ci_emis_de: { label: 'CI Emis De' },
    ci_emis_la: { label: 'CI Emis La' },

    status: { label: 'Status' },
    channel: { label: 'Canal' },
    source: { label: 'Sursa' },
    consumption: { label: 'Consum Anual' },

    // cros__internal_id: { label: 'CROS ID' },
    internal_id: { label: 'CROS ID' },
    cros__campaign_type: { label: 'CROS Tip Campanie' },
    cros__note: { label: 'CROS Notita' },
    cros__agent: { label: 'CROS Agent' },

    contact__acord_mk: { label: 'Acord Marketing PPC', parse: parseBoolean },
    contact__acord_part: { label: 'Acord Marketing Parteneri', parse: parseBoolean },
    contact__canal_sms: { label: 'Acord Canal SMS', parse: parseBoolean },
    contact__canal_sms_text: { label: 'Acord Canal SMS - Telefon' },
    contact__canal_email: { label: 'Acord Canal Email', parse: parseBoolean },
    contact__canal_email_text: { label: 'Acord Canal Email - Email' },
    contact__canal_telefon: { label: 'Acord Canal Telefon', parse: parseBoolean },
    contact__canal_telefon_text: { label: 'Acord Canal Telefon - Telefon' },
    contact__canal_posta: { label: 'Acord Canal Posta', parse: parseBoolean },
    contact__canal_posta_adresa__bloc: { label: 'Acord Canal Posta - Bloc' },
    contact__canal_posta_adresa__etaj: { label: 'Acord Canal Posta - Etaj' },
    contact__canal_posta_adresa__judet: { label: 'Acord Canal Posta - Judet' },
    contact__canal_posta_adresa__scara: { label: 'Acord Canal Posta - Scara' },
    contact__canal_posta_adresa__strada: { label: 'Acord Canal Posta - Strada' },
    contact__canal_posta_adresa__nr_strada: { label: 'Acord Canal Posta - Nr Strada' },
    contact__canal_posta_adresa__apartament: { label: 'Acord Canal Posta - Apartament' },
    contact__canal_posta_adresa__cod_postal: { label: 'Acord Canal Posta - Cod Postal' },
    contact__canal_posta_adresa__localitate: { label: 'Acord Canal Posta - Localitate' },
    contact__canal_posta_adresa__tip_artera: { label: 'Acord Canal Posta - Tip Strada' },

    // place__cod_pod: { label: 'Loc Consum - POD' },
    pod: { label: 'Loc Consum - POD' },
    place__nlc: { label: 'Loc Consum - NLC' },
    place__eneltel: { label: 'Loc Consum - Electel' },
    place__tip_consum: { label: 'Loc Consum - Tip Consum' },
    place__tip_serviciu: { label: 'Loc Consum - Tip Serviciu' },
    place__judet: { label: 'Loc Consum - Judet' },
    place__localitate: { label: 'Loc Consum - Localitate' },
    place__tip_artera: { label: 'Loc Consum - Tip Strada' },
    place__strada: { label: 'Loc Consum - Strada' },
    place__nr_strada: { label: 'Loc Consum - Nr Strada' },
    place__bloc: { label: 'Loc Consum - Bloc' },
    place__scara: { label: 'Loc Consum - Scara' },
    place__etaj: { label: 'Loc Consum - Etaj' },
    place__apartament: { label: 'Loc Consum - Apartament' },
    place__cod_caen: { label: 'Loc Consum - Cod Caen' },
    place__nivel_tensiune: { label: 'Loc Consum - Nivel Tensiune' },
    place__pressure: { label: 'Loc Consum - Presiune' },
    place__presureLevel: { label: 'Loc Consum - Nivel Presiune' },
    place__categorie_gaz: { label: 'Loc Consum - Categorie Gaz' },
    place__distribuitor: { label: 'Loc Consum - Distribuitor' },
    place__stare_contract: { label: 'Loc Consum - Stare Contract' },
    place__furnizor_actual: { label: 'Loc Consum - Furnizor Actual' },
    place__valabilitate: { label: 'Loc Consum - Valabilitate' },
};

export const LEAD_CHANNELS = ['vi', 'pe', 'ik', 'cc'];
export const CAMPAIGN_TYPES = ['Hard VAS', 'Soft VAS', 'Switch', 'Gaz', 'Altele'];

/**
 * Lead status
 */
export const LEAD_STATUS = {
    PROSPECT: 'PROSPECT',
    ALLOCATED_CHANNEL: 'ALLOCATED_CHANNEL',
    ALLOCATED_COMPANY: 'ALLOCATED_COMPANY',
    INTERMEDIARY: 'INTERMEDIARY',
    FINAL: 'FINAL',
    CUSTOMER: 'CUSTOMER',
    LOST_SALE: 'LOST_SALE',
};

export const STATUS_LABELS = {
    [LEAD_STATUS.PROSPECT]: 'Prospect',
    [LEAD_STATUS.ALLOCATED_CHANNEL]: 'Alocat Manager Canal',
    [LEAD_STATUS.ALLOCATED_COMPANY]: 'Alocat Team Leader Partner',
    [LEAD_STATUS.INTERMEDIARY]: 'Intermediar',
    [LEAD_STATUS.FINAL]: 'Final',
    [LEAD_STATUS.CUSTOMER]: 'Client',
    [LEAD_STATUS.LOST_SALE]: 'Vanzare pierduta',
};

/**
 * Lead substatus
 */
export const LEAD_SUBSTATUS = {
    // Intermediary
    UNDECIDED: 'UNDECIDED',
    MISSING_DECIDING_PERSON: 'MISSING_DECIDING_PERSON',
    NO_ANSWER: 'NO_ANSWER',
    REQUIRED_CALL_BACK: 'REQUIRED_CALL_BACK',
    VOICE_MESSAGING: 'VOICE_MESSAGING',

    // Final
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    REFUSED_TO_TALK: 'REFUSED_TO_TALK',
    REFUSED_THE_OFFER: 'REFUSED_THE_OFFER',
    DATABASE_EXCLUDED: 'DATABASE_EXCLUDED',
    NOT_ELIGIBLE: 'NOT_ELIGIBLE',
    WRONG_NUMBER: 'WRONG_NUMBER',
    INEXISTENT_NUMBER: 'INEXISTENT_NUMBER',
    TRANSFERRED_LEAD: 'TRANSFERRED_LEAD',
};

export const SUBSTATUS_LABELS = {
    // Intermediary
    [LEAD_SUBSTATUS.UNDECIDED]: 'Indecis',
    [LEAD_SUBSTATUS.MISSING_DECIDING_PERSON]: 'Lipsa Persoana decidenta',
    [LEAD_SUBSTATUS.NO_ANSWER]: 'Nu a raspuns',
    [LEAD_SUBSTATUS.REQUIRED_CALL_BACK]: 'Necesita telefonare dinou',
    [LEAD_SUBSTATUS.VOICE_MESSAGING]: 'Mesagerie',

    // Final
    [LEAD_SUBSTATUS.NOT_AVAILABLE]: 'Nu e disponibil',
    [LEAD_SUBSTATUS.REFUSED_TO_TALK]: 'Refuz convorbire',
    [LEAD_SUBSTATUS.REFUSED_THE_OFFER]: 'Refuz oferta',
    [LEAD_SUBSTATUS.DATABASE_EXCLUDED]: 'Exclus din baza de date',
    [LEAD_SUBSTATUS.NOT_ELIGIBLE]: 'Neeligibil',
    [LEAD_SUBSTATUS.WRONG_NUMBER]: 'Numar gresit',
    [LEAD_SUBSTATUS.INEXISTENT_NUMBER]: 'Numar inexistent',
    [LEAD_SUBSTATUS.TRANSFERRED_LEAD]: 'Lead transferat',
};

export const SUBSTATUS_MAPPING = {
    [LEAD_STATUS.INTERMEDIARY]: [
        LEAD_SUBSTATUS.UNDECIDED,
        LEAD_SUBSTATUS.MISSING_DECIDING_PERSON,
        LEAD_SUBSTATUS.REQUIRED_CALL_BACK,
        LEAD_SUBSTATUS.VOICE_MESSAGING,
    ],
    [LEAD_STATUS.FINAL]: [
        LEAD_SUBSTATUS.NOT_AVAILABLE,
        LEAD_SUBSTATUS.REFUSED_TO_TALK,
        LEAD_SUBSTATUS.REFUSED_THE_OFFER,
        LEAD_SUBSTATUS.DATABASE_EXCLUDED,
        LEAD_SUBSTATUS.NOT_ELIGIBLE,
        LEAD_SUBSTATUS.WRONG_NUMBER,
        LEAD_SUBSTATUS.INEXISTENT_NUMBER,
        LEAD_SUBSTATUS.TRANSFERRED_LEAD,
    ],
};

export const LEAD_IMPORT_ERROR = {
    DUPLICATED_INTERNAL_ID: 'DUPLICATED_INTERNAL_ID',
    DUPLICATED_CNP: 'DUPLICATED_CNP',
    DUPLICATED_PHONE: 'DUPLICATED_PHONE',
    DUPLICATED_POD: 'DUPLICATED_POD',
    REQUIRED_FULL_NAME: 'REQUIRED_FULL_NAME',
    INVALID_EDIT_STATUS: 'INVALID_EDIT_STATUS',
    INVALID_CAMPAIGN_TYPE: 'INVALID_CAMPAIGN_TYPE',
    MISSING_CAMPAIGN_AGREEMENT_PHONE: 'MISSING_CAMPAIGN_AGREEMENT_PHONE',
    MISSING_CAMPAIGN_AGREEMENT_PART: 'MISSING_CAMPAIGN_AGREEMENT_PART',
};

export const IMPORT_ERROR_LABELS = {
    [LEAD_IMPORT_ERROR.DUPLICATED_INTERNAL_ID]: 'Acest CROS ID exista deja in baza de date.',
    [LEAD_IMPORT_ERROR.DUPLICATED_CNP]: 'Acest CNP exista deja in baza de date.',
    [LEAD_IMPORT_ERROR.DUPLICATED_PHONE]: 'Acest telefon exista deja in baza de date.',
    [LEAD_IMPORT_ERROR.DUPLICATED_POD]: 'Acest POD exista deja in baza de date.',
    [LEAD_IMPORT_ERROR.REQUIRED_FULL_NAME]: 'Numele leadului este obligatoriu pentru import.',
    [LEAD_IMPORT_ERROR.INVALID_EDIT_STATUS]:
        'Statusul leadului deja existent in sistem nu permite actualizarea sa. (e.g. Final)',
    [LEAD_IMPORT_ERROR.INVALID_CAMPAIGN_TYPE]:
        'Tipul campaniei nu este valid. (e.g. Hard VAS, Soft VAS, Switch, Gaz, Altele)',
    [LEAD_IMPORT_ERROR.MISSING_CAMPAIGN_AGREEMENT_PHONE]:
        'Acest tip de campanie necesita acord telefonic.',
    [LEAD_IMPORT_ERROR.MISSING_CAMPAIGN_AGREEMENT_PART]:
        'Acest tip de campanie necesita acord partener.',
};

export const getImportKey = data => {
    for (let i = 0; i < IMPORT_KEYS.length; i++) {
        const key = IMPORT_KEYS[i];
        if (data[key]) return key;
    }
    return '';
};

export const getImportSubkeys = data => {
    const key = getImportKey(data);
    const keyIndex = IMPORT_KEYS.indexOf(key) + 1;
    const subkeys = IMPORT_KEYS.slice(keyIndex).filter(key => data[key]);

    return subkeys;
};

export const buildLead = (csvJSON, csvIndex, importTemplate) => {
    const lead = {};
    _.each(importTemplate, (column, keys) => {
        let keyParts = keys.split('__');
        let data = lead;
        keyParts.forEach((key, i) => {
            if (i === keyParts.length - 1) {
                const value = csvJSON[csvIndex][column - 1];
                data[key] = LEAD_PARAMS[keys].parse ? LEAD_PARAMS[keys].parse(value) : value;
            } else if (i === 0) {
                if (!lead[key]) lead[key] = {};
                data = lead[key];
            } else {
                if (!data[key]) data[key] = {};
                data = data[key];
            }
        });
    });
    return lead;
};

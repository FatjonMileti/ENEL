import api from './api';
import moment from 'moment';

async function createSession(leadInfo) {
    const session = await populateClientInfo(leadInfo);
    await populatePlaceOfConsumption(session.id, leadInfo);
    populateInvoiceData(session.id, leadInfo);

    return session.id;
}

async function populateClientInfo(leadInfo) {
    let responseData = await create();

    let sessionData = {
        judet: leadInfo.originalData.judet,
        client: {
            cnp: leadInfo.cnp,
            judet: leadInfo.county,
            localitate: leadInfo.originalData.body[29],
            strada: leadInfo.originalData.body[9],
            nume: leadInfo.fullName.split(' ')[0],
            prenume: leadInfo.fullName.split(' ')[1],
            telefon_mobil: leadInfo.originalData.body[3],
            email: leadInfo.originalData.body[4],
            telefon_fix: leadInfo.originalData.body[2],
            ci_serie: leadInfo.originalData.body[15],
            ci_numar: leadInfo.originalData.body[16],
            ci_emis_de: '',
            ci_emis_la: leadInfo.originalData.body[18],
            tip_artera: leadInfo.originalData.body[30],
            nr_strada: leadInfo.originalData.body[32],
            bloc: leadInfo.originalData.body[33],
            scara: leadInfo.originalData.body[34],
            etaj: leadInfo.originalData.body[36],
            apartament: leadInfo.originalData.body[35],
        },
    };

    return await api.patchJSON(`/session/${responseData.id}`, sessionData);
}

async function populatePlaceOfConsumption(sessionID, leadInfo) {
    let flow = getFlow(leadInfo);
    let sessionData = {
        [`${flow}_loc`]: {
            cod_pod: leadInfo.pod,
            nlc: leadInfo.originalData.body[37],
            distribuitor_id: leadInfo.originalData.body[54],
            judet: leadInfo.county,
        },
        [`${flow}_are_furnizare_activa`]: false,
        [`${flow}_schimba_titular`]: false,
        [`${flow}_furnizor_data_start`]: moment(
            leadInfo.originalData.body[59],
            'DD.MM.YYYY'
        ).format('YYYY-MM-DD'),
    };
    await api.patchJSON(`/session/${sessionID}`, sessionData);
}

async function populateInvoiceData(sessionID, leadInfo) {
    await api.get(`/info-nlc/${leadInfo.pod}`);

    let flow = getFlow(leadInfo);
    let sessionData = {
        [`${flow}_factura`]: {
            avans: 'FACTURA',
            judet: leadInfo.county,
            localitate: leadInfo.originalData.body[29],
            tip_artera: leadInfo.originalData.body[30],
            strada: leadInfo.originalData.body[9],
            nr_strada: leadInfo.originalData.body[32],
            bloc: leadInfo.originalData.body[33],
            //mod_corespondenta : 'POSTA',
            email: leadInfo.originalData.body[4],
        },
    };
    await api.patchJSON(`/session/${sessionID}`, sessionData);
}

async function create() {
    const result = await api.post('/session', {});
    return result;
}

function getFlow(leadInfo) {
    let flow = '';
    if (leadInfo.originalData.body[41].includes('EL')) {
        flow = 'ee';
    } else if (leadInfo.originalData.body[41].includes('GAZ')) {
        flow = 'gaz';
    } else {
        flow = 'combo';
    }
    return flow;
}

export default createSession;

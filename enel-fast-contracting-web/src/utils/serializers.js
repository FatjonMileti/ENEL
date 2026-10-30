import { getStepIdByPathname, getSessionFlowData } from './helpers';

export const toRegistrationPostData = (data, props) => {
    const { session, flow, location } = props;
    const { pathname } = location;

    const {
        firstName,
        lastName,
        clientEmail,
        companyName,
        companyTelefon,
        companyEmail,
        companyRepresentativeName,
        companyRepresentativeLastame,
        clientPhoneNumber,
        ee_are_furnizare_activa,
        ee_schimba_titular,
        ee_furnizor_actual,
        gaz_are_furnizare_activa,
        gaz_schimba_titular,
        gaz_furnizor_actual,
        codPod,
        localitate,
        tip_artera,
        strada,
        nume_strada,
        nr_strada,
        bloc,
        scara,
        apartament,
        etaj,
        cod_oferta,
        problemDescription,
        abortProcess,
        registrationPageURL,
        stepId,
    } = data;
    // eslint-disable-next-line prefer-const

    const path = pathname.replace('/', '');

    const result = {
        step_id: stepId || getStepIdByPathname(path),
        id_fsd: session.id,
    };
    if (typeof cod_oferta !== 'undefined') {
        result['cod_oferta'] = cod_oferta;
    }

    // TODO find better way to check data for each step
    if (typeof registrationPageURL !== 'undefined') {
        result.page_url = registrationPageURL;
    }

    if (session.contract_type === 'b2c' && clientEmail && clientPhoneNumber || session.contract_type === 'b2b' && companyEmail && companyTelefon) {
        const currentSessionFlowData = getSessionFlowData(session, flow);
        result.cod_oferta = currentSessionFlowData.cod;
        result.denumire_produs = currentSessionFlowData.denumire;
        result.judet = session.judet;
        result.nume = session.contract_type === 'b2b' ? companyRepresentativeLastame : lastName;
        result.prenume = session.contract_type === 'b2b' ? companyRepresentativeName : firstName;
        result.email = session.contract_type === 'b2b' ? companyEmail : clientEmail;
        result.telefon = session.contract_type === 'b2b' ? companyTelefon : clientPhoneNumber;
        result.nume_companie = companyName;
    }

    if (typeof ee_are_furnizare_activa !== 'undefined') {
        result.is_titular = ee_schimba_titular;
        result.furnizare = ee_are_furnizare_activa;
        result.id_furnizor = ee_furnizor_actual;
    }

    if (typeof gaz_are_furnizare_activa !== 'undefined') {
        result.is_titular = gaz_schimba_titular;
        result.furnizare = gaz_are_furnizare_activa;
        result.id_furnizor = gaz_furnizor_actual;
    }

    if (result.step_id === 'dossierClientIdentification' && session && (session.contract_type === 'b2c' && session.client && session.client.cnp || session.contract_type === 'b2b' && session.company && session.company.data && session.company.data.cui)) {
        if (session.contract_type === 'b2c') {
            result.CNP = session.client.cnp;
        }
        if (session.contract_type === 'b2b') {
            result.CUI = session.company.data.cui;
        }
        result.nume = session.contract_type === 'b2b' ? session.company.legal_representative && session.company.legal_representative.nume : session.client.nume;
        result.prenume = session.contract_type === 'b2b' ? session.company.legal_representative && session.company.legal_representative.prenume : session.client.prenume;
    }

    if (typeof codPod !== 'undefined') {
        result.NLC = { nlc_cod_pod: codPod };
    }

    if (typeof localitate !== 'undefined') {
        result.NLC = {
            nlc_localitate: localitate,
            nlc_tip_artera: tip_artera,
            nlc_nume_strada: nume_strada,
            nlc_strada: strada,
            nlc_nr_strada: nr_strada,
            nlc_bloc: bloc,
            nlc_scara: scara,
            nlc_apartament: apartament,
            nlc_etaj: etaj,
        };
    }

    if (typeof problemDescription !== 'undefined') {
        result.feedback_body = `${path} | ${problemDescription}`;
    }

    if (typeof abortProcess !== 'undefined') {
        result.dossier_close = true;
    }

    return result;
};

export const toRegistrationEmailData = (data, id, template) => ({
    email: data.email,
    dossier: id,
    template,
});

export const toEnergyInfoSelect = energyInfo =>
    Object.keys(energyInfo).map(i => ({ value: i, label: energyInfo[i] }));

export const toClientTypeSelect = clientType =>
    Object.keys(clientType).map(i => ({ value: i, label: clientType[i] }));

export const toEnergyTypeData = energyType => (energyType === 'ELECTRICA' ? 'EE' : 'GAZ');

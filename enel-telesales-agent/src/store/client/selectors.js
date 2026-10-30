import _ from 'lodash';
import { getSession } from 'store/session/selectors';

export function getClient(state) {
    return state.client.info;
}

export function getNLC(state) {
    return state.client.nlc;
}

export function getNLCValidation(state) {
    return state.client.nlcValidation;
}

export function getFlow(state) {
    return state.client ? state.client.flow : '';
}

export function getOptions(state) {
    return state.client.options;
}

export function getLink(state) {
    return state.client.link;
}

export function getStartDate(state) {
    return state.client.startDate;
}

export function getError(state) {
    return state.client ? state.client.error : '';
}

export function hasEmail(state) {
    return state.client ? state.client.hasEmail : false;
}

export function isLinkSent(state) {
    const session = getSession(state);
    if (state.client && state.client.link) return true;
    return session && (!!session.link_sent_date || !!session.client_upload_agree_date);
}

export function hasClientSignedAgreement(state) {
    const session = getSession(state);
    return session && session.signature_agree_date;
}

export function isFastFlux(state) {
    const nlc = getNLC(state);
    const session = getSession(state);
    const ownerChanged = session.ee_schimba_titular
        ? session.ee_schimba_titular
        : session.gaz_schimba_titular;
    return (
        _.size(nlc) === 1 &&
        //_.first(_.values(nlc)).piata === 'PR' &&
        _.first(_.values(nlc)).cnp_cui != null &&
        !ownerChanged &&
        _.first(_.values(nlc)).status == 'ACTIV'
    );
}

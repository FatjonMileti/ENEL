const STATUS = {
    CLIENT_OFFER_ACCEPTED: 'CLIENTUL ACCEPTA SA FIE OFERTAT',
    //CLIENT_OFFER_SENT: 'LINK CONTRACTARE TRIMIS',
    CLIENT_DOCS_NOT_UPLOADED: 'LINK TRIMIS/DOC. CLIENT INCOMPLETE',
    CLIENT_DOCS_UPLOADED: 'DOCUMENTE CLIENT COMPLETE',
    CLIENT_CONTRACT_SENT_SMS: 'LINK DOCUMENTE TRIMIS (SMS)',
    CLIENT_CONTRACT_SENT_EMAIL: 'LINK DOCUMENTE TRIMIS (EMAIL)',
    ACTIVATED: 'CONTRACT ACCEPTAT',
    REJECTED: 'REFUZ AGENT',
    OFFER_ERR: 'EROARE LA OFERTARE',
    ACTIVATE_ERR: 'EROARE LA ACTIVARE',
};

class SessionService {
    getStatusLabel(status) {
        return STATUS[status];
    }

    getStatus(session) {
        if (session.status === 'NEW' || session.status === 'OFFER') {
            if (session.client_upload_agree_date) {
                return this.getStatusLabel('CLIENT_DOCS_UPLOADED');
            }

            if (session.client_upload_agree_date == null && session.link_sent_date) {
                return this.getStatusLabel('CLIENT_DOCS_NOT_UPLOADED');
            }

            if (session.client_upload_agree_date == null && session.link_sent_date == null) {
                return this.getStatusLabel('CLIENT_OFFER_ACCEPTED');
            }

            //if (session.link_sent_date) {
            //    return this.getStatusLabel('CLIENT_OFFER_SENT');
            // }
        }

        if (session.status === 'SIGN') {
            if (
                (session.ee_sign_success && session.ee_sign_channel === 'SMS') ||
                (session.gaz_sign_success && session.gaz_sign_channel === 'SMS')
            ) {
                return this.getStatusLabel('CLIENT_CONTRACT_SENT_SMS');
            }

            if (
                (session.ee_sign_success && session.ee_sign_channel === 'EMAIL') ||
                (session.gaz_sign_success && session.gaz_sign_channel === 'EMAIL')
            ) {
                return this.getStatusLabel('CLIENT_CONTRACT_SENT_EMAIL');
            }
        }
        if (
            (session && session.type && session.type === 'EE' && session.ee_agree) ||
            (session.type &&
                typeof session.type !== 'undefined' &&
                session.type.toUpperCase() === 'GAZ' &&
                session.gaz_agree) ||
            (session.type === 'COMBO' && session.ee_agree && session.gaz_agree)
        ) {
            if (session.status === 'ACTIVATE_ERR') return this.getStatusLabel('ACTIVATE_ERR');
            else return this.getStatusLabel('ACTIVATED');
        }
        if (session.ee_agree === false || session.gaz_agree === false) {
            return this.getStatusLabel('REJECTED');
        }

        return this.getStatusLabel(session.status) || session.status;
    }
}

export default new SessionService();

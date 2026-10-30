export function parseType(type) {
    switch (type) {
        case 'EE':
            return 'Electricitate';
        case 'GAZ':
            return 'Gaz';
        case 'COMBO':
            return 'Combo';
        default:
            return '-';
    }
}

export function parseStatus(session) {
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
}

export function parseLastStep(session) {
    if (session.type === 'EE' || session.type === 'COMBO')
        return session.ee_last_page;
    if (session.type === 'GAZ')
        return session.gaz_last_page;
    return '-';
}
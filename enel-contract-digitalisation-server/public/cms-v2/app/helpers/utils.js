import { isEmail as e_mail } from 'validator';

export function isEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const email = value => {
    if (value && value.toString().length > 0 && !e_mail(value)) {
        return 'Adresa de e-mail nu este validă.';
    }
};

export const phone = value => {
    if (value && value.toString().length > 0 && !/^07[\d]{8}$/.test(value)) {
        return 'Telefonul mobil nu este valid.';
    }
};

export const landLine = value => {
    if (value && value.toString().length > 0 && value.toString().length !== 10) {
        return 'Telefonul fix nu este valid.';
    }
};
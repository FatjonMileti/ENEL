/* eslint-disable indent */
import React from 'react';
import { isEmail } from 'validator';
import moment from 'moment';
import _ from 'lodash';

import clientService from 'services/client';

export const required = (value, props) => {
    if (_.isNil(value) || value === '' || (props.isCheckable && !props.checked)) {
        return 'Câmp obligatoriu.';
    }
};

export const email = (value) => {
    if (value.toString().length > 0 && !isEmail(value)) {
        return 'Adresa de e-mail nu este validă.';
    }
};

export const matchEmail = (current, confirm) => {
    if (current !== confirm) {
        return 'Adresa de e-mail este diferită.';
    }
};

export const codPostal = (value) => {
    if (value.toString() && value.toString().length !== 6) {
        return 'Codul poștal trebuie să conțină 6 cifre';
    }
};

export const earlierThanToday = (value) => {
    const today = moment();
    today.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, 'YYYY-MM-DD');
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isAfter(today)) {
        return 'Data trebuie să fie înaintea zilei curente.';
    }
};

export const laterThanToday = (value) => {
    const today = moment();
    today.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, 'YYYY-MM-DD');
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isBefore(today)) {
        return 'Data nu se poate afla în trecut.';
    }
};

export const laterThanDays = (value, days) => {
    const minDate = moment().add(days, 'days');
    minDate.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, 'YYYY-MM-DD');
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isBefore(minDate)) {
        return `Alegeți o data cu cel puțin ${days} zile mai mare față de ziua curentă.`;
    }
};

export const cui = (value) => {
    // if (!/^(RO)?\d{8}$/g.test(value)) return 'CUI-ul nu este valid.';
};

export const cnp = (value) => {
    let year = 0;
    let hashResult = 0;
    const cnp = [];
    const hashTable = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

    if (value.length !== 13) return 'CNP-ul nu este valid.';

    for (let i = 0; i < 13; i++) {
        cnp[i] = parseInt(value.charAt(i), 10);
        if (!_.isNumber(cnp[i])) return 'CNP-ul nu este valid.';
        if (i < 12) hashResult += (cnp[i] * hashTable[i]);
    }

    hashResult %= 11;
    if (hashResult === 10) hashResult = 1;

    year = (cnp[1] * 10) + cnp[2];
    switch (cnp[0]) {
        case 1:
        case 2:
            year += 1900;
            break;
        case 3:
        case 4:
            year += 1800;
            break;
        case 5:
        case 6:
            year += 2000;
            break;
        case 7:
        case 8:
        case 9:
            year += 2000;
            if (year > (parseInt(new Date().getYear(), 10) - 14)) year -= 100;
            break;
        default:
            return 'CNP-ul nu este valid.';
    }

    if (year < 1800 || year > 2099) return 'CNP-ul nu este valid.';
    if (cnp[12] !== hashResult) return 'CNP-ul nu este valid.';
};

export const iban = (value) => {
    if (!(/^RO[A-Za-z0-9]{22}$/.test(value))) {
        return 'IBAN-ul nu este valid.';
    }
};

export const number = (value) => {
    if (!(/^[0-9.]*?$/.test(value))) {
        return 'Câmpul nu este valid.';
    }
};

export const integer = (value) => {
    if (!(/^[0-9]*?$/.test(value))) {
        return 'Câmpul nu este valid.';
    }
};

export const containsDigit = (value) => {
    const re = /[0-9]/;
    const result = re.test(String(value).toLowerCase());
    if (result == false) {
        return 'Trebuie să contină cel putin o cifră.';
    }
};

export const localFormattedNumber = (value) => {
    if (!/^\d{1,3}(.?\d{3})*(\,\d+)?$/.test(value)) {
        return 'Câmpul nu este valid.';
    }
};

export const localFormattedNumberWithoutDecimal = (value) => {
    if (!/^\d{1,3}(.?\d{3})?$/.test(value)) {
        return 'Câmpul nu este valid.';
    }
};

export const cnpAdult = (value) => {
    const ADULT_AGE = 18;
    if (clientService.getAgeFromCNP(value) < ADULT_AGE) {
        return 'Trebuie îndeplinită condiția legală de vârstă.';
    }
};

export const tel = (value) => {
    if (value.toString().length > 0 && !(/^07[\d]{8}$/.test(value))) {
        return 'Telefonul mobil nu este valid.';
    }
};

export const serieBuletin = (value) => {
    if (!(/^[A-Za-z]{2}$/.test(value))) {
        return 'Seria nu este validă.';
    }
};

export const max10 = (value) => {
    if (value.toString().length > 10) {
        return 'Pot fi introduse maxim 10 caractere.';
    }
};

export const maxLength = (value, length) => {
    if (value.toString().length > length) {
        return `Pot fi introduse maxim ${length} caractere.`;
    }
};

export const minValue = minValue => (value) => {
    if (parseFloat(value) < parseFloat(minValue)) {
        return `Valoarea minima acceptata este ${minValue}.`;
    }
};

export const maxValue = maxValue => (value) => {
    if (parseFloat(value) > parseFloat(maxValue)) {
        return `Valoarea maxima acceptata este ${maxValue}.`;
    }
};


export const putereAvizata = session => (value) => {
    if (value != null && value != undefined) {
        if (!_.isNumber(+value)) {
            return 'Campul Putere avizata trebuie sa contina cifre!';
        }
        if ((session.ee_loc.cod_pod.startsWith('RO001E') || session.ee_loc.cod_pod.startsWith('RO002E') || session.ee_loc.cod_pod.startsWith('RO005E')) && (+value < 1)) {
            return 'Campul Putere avizata este necesar!';
        }
        if (+value < 1) { return 'Campul Putere avizata trebuie sa contina cifre!'; }
    } else if (session.ee_loc.cod_pod.startsWith('RO001E') || session.ee_loc.cod_pod.startsWith('RO002E') || session.ee_loc.cod_pod.startsWith('RO005E')) {
        return 'Campul Putere avizata este necesar!';
    }
};


export const time = (value) => {
    const [hours, minutes] = [value.substring(0, 2), value.substring(2, 4)];

    if (parseInt(hours) > 23) {
        return `: ${hours} is an invalid hours value`;
    }

    if (parseInt(minutes) > 59) {
        return `: ${minutes} is an invalid minutes value`;
    }

    if (value.length < 4) {
        return 'should be in hh:mm format';
    }
};

export const month = (value) => {
    if (value) {
        if (!value.match(/^\d{2}\/\d{4}$/g)) {
            return 'ar trebui sa fie in format mm/yyyy';
        }

        const [inputMonth, inputYear] = [
            parseInt(value.substring(0, 2)),
            parseInt(value.substring(3, 7)),
        ];
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;

        if (inputMonth < 0 || inputMonth > 12) {
            return `${inputMonth} nu este o valoare corecta pt luna`;
        }
        if (inputYear > currentYear) {
            return `Anul nu trebuie sa fie mai mare ca anul curent ${currentYear}`;
        } else if (inputYear < 1900) {
            return 'Anul trebuie sa fie mai mare ca 1900';
        } else if (inputYear === currentYear) {
            if (inputMonth > currentMonth) { return `Luna nu trebuie sa fie mai mare ca luna curenta ${currentMonth}`; }
        }
    }
};

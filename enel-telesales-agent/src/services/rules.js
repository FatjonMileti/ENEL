import { isEmail } from 'validator';
import moment from 'moment';
import _ from 'lodash';

const DATE_FORMAT = 'DD.MM.YYYY';

export const required = value => {
    if (_.isNil(value) || value === '') {
        return 'Câmp obligatoriu.';
    }
};

export const requiredEnelTel = value => {
    if (_.isNil(value) || value === '') {
        return 'Te rog completeaza campul obligatoriu Electel.';
    }
};

export const requiredBefore = event => value => {
    if ((!event && _.isNil(value)) || value === '') {
        return 'Completare înainte de selectare ofertă.';
    }
};

export const requiredAfter = (event, ignoreEvent) => value => {
    if ((event && _.isNil(value)) || value === '' || (ignoreEvent && value === undefined)) {
        return 'Completare înainte de generare contract.';
    }
};

export const email = value => {
    if (value && value.toString().length > 0 && !isEmail(value)) {
        return 'Adresa de e-mail nu este validă.';
    }
};

export const codPostal = value => {
    if (value && value.toString() && value.toString().length !== 6) {
        return 'Codul poștal trebuie să conțină 6 cifre';
    }
};

export const earlierThanToday = value => {
    const today = moment();
    today.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, DATE_FORMAT);
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isAfter(today)) {
        return 'Data trebuie să fie înaintea zilei curente.';
    }
};

export const laterThanToday = value => {
    const today = moment();
    today.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, DATE_FORMAT);
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isBefore(today)) {
        return 'Data nu se poate afla în trecut.';
    }
};

export const greaterThanToday = value => {
    const today = moment();
    today.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    today.add(1, 'day');
    const date = moment(value, DATE_FORMAT);

    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isBefore(today)) {
        return 'Data minima azi + 1';
    }
};

export const laterThanDays = days => value => {
    const minDate = moment().add(days, 'days');
    minDate.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, DATE_FORMAT);
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isBefore(minDate)) {
        return `Alegeți o data cu cel puțin ${days} zile mai mare față de ziua curentă.`;
    }
};

export const earlierThanDays = days => value => {
    const maxDate = moment().add(days, 'days');
    maxDate.set({
        hour: 0,
        minute: 0,
        second: 0,
    });
    const date = moment(value, DATE_FORMAT);
    date.set({
        hour: 0,
        minute: 0,
        second: 1,
    });
    if (date.isAfter(maxDate)) {
        return `Alegeți o data cu pana la ${days} zile mai mare față de ziua curentă.`;
    }
};

export const cnp = value => {
    if (value) {
        let year = 0;
        let hashResult = 0;
        const cnp = [];
        const hashTable = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

        if (value.length !== 13) {
            return 'CNP-ul nu este valid.';
        }

        for (let i = 0; i < 13; i++) {
            cnp[i] = parseInt(value.charAt(i), 10);
            if (!_.isNumber(cnp[i])) {
                return 'CNP-ul nu este valid.';
            }
            if (i < 12) {
                hashResult += cnp[i] * hashTable[i];
            }
        }

        hashResult %= 11;
        if (hashResult === 10) {
            hashResult = 1;
        }

        year = cnp[1] * 10 + cnp[2];
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
                if (year > parseInt(new Date().getYear(), 10) - 14) {
                    year -= 100;
                }
                break;
            default:
                return 'CNP-ul nu este valid.';
        }

        if (year < 1800 || year > 2099) {
            return 'CNP-ul nu este valid.';
        }
        if (cnp[12] !== hashResult) {
            return 'CNP-ul nu este valid.';
        }
    }
};

export const iban = value => {
    if (!/^RO[A-Za-z0-9]{22}$/.test(value)) {
        return 'IBAN-ul nu este valid.';
    }
};

export const putereAvizata = sessionPod => value => {
    if (value) {
        if (!_.isNumber(+value)) {
            return 'Campul Putere avizata trebuie sa contina cifre!';
        } else {
            if (
                sessionPod.startsWith('RO001E') ||
                sessionPod.startsWith('RO002E') ||
                sessionPod.startsWith('RO005E')
            ) {
                return 'Campul Putere avizata este necesar!';
            }
        }
    } else if (
        sessionPod.startsWith('RO001E') ||
        sessionPod.startsWith('RO002E') ||
        sessionPod.startsWith('RO005E')
    ) {
        return 'Campul Putere avizata este necesar!';
    }
};

export const number = value => {
    if (!/^[0-9.]*?$/.test(value)) {
        return 'Câmpul nu este valid.';
    }
};

export const localFormattedNumber = value => {
    if (!/^\d{1,3}(.?\d{3})*(\,\d+)?$/.test(value)) {
        return 'Câmpul nu este valid.';
    }
};

export const localFormattedNumberWithoutDecimal = value => {
    if (!/^\d{1,3}(.?\d{3})?$/.test(value)) {
        return 'Câmpul nu este valid.';
    }
};

export const stringWithNumber = value => {
    var re = /[0-9]/;
    var inputValue = String(value).toLowerCase();
    let containsDigit = re.test(inputValue);
    if (containsDigit === false) {
        return 'Trebuie să contină cel putin o cifră.';
    }
};

export const integer = value => {
    if (value && !/^[0-9]*?$/.test(value)) {
        return 'Câmpul nu este valid.';
    }
};

export const tel = value => {
    if (value && value.toString().length > 0 && !/^07[\d]{8}$/.test(value)) {
        return 'Telefonul mobil nu este valid.';
    }
};

export const caenCode = value => {
    if (!/^\d{4}$/.test(value)) return 'Cod CAEN nu este valid.';
};

export const cui = value => {
    //if (!/^(RO)?\d{8}$/g.test(value)) return 'CUI-ul nu este valid.';
};

export const telFix = value => {
    if (value && value.toString().length > 0 && value.toString().length !== 10) {
        return 'Telefonul fix nu este valid.';
    }
};

export const serieBuletin = value => {
    if (value && !/^[A-Za-z]{2}$/.test(value)) {
        return 'Seria nu este validă.';
    }
};

export const max10 = value => {
    if (value && value.toString().length > 10) {
        return 'Pot fi introduse maxim 10 caractere.';
    }
};

export const maxLength = length => value => {
    if (value && value.toString().length > length) {
        return `Pot fi introduse maxim ${length} caractere.`;
    }
};

export const minValue = minValue => value => {
    if (parseFloat(value) < parseFloat(minValue)) {
        return `Valoarea minima acceptata este ${minValue}.`;
    }
};

export const maxValue = maxValue => value => {
    if (parseFloat(value) > parseFloat(maxValue)) {
        return `Valoarea maxima acceptata este ${maxValue}.`;
    }
};

export const time = value => {
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

export const month = value => {
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
            if (inputMonth > currentMonth)
                return `Luna nu trebuie sa fie mai mare ca luna curenta ${currentMonth}`;
        }
    }
};

// export const validDateFormat = value => {
//     if (value.length !== 10 || !value.match(/^\d{2}\/\d{2}\/\d{4}$/g)) {
//         return 'should be in dd/mm/yyyy format';
//     }
//     if (!moment(value).isValid()) return 'Not valid date';
// };

export const mix = (...rules) => value => {
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (rule && rule(value)) {
            return rule(value);
        }
    }
};

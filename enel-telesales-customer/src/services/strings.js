import _ from 'lodash';

class StringsService {
    capitalize(value) {
        value = value
            .split(' ')
            .map(item => _.capitalize(item))
            .join(' ');
        value = value
            .split('-')
            .map(item => _.capitalize(item))
            .join('-');

        return value;
    }

    formatPrice(price, key) {
        const decs = key.match('abonament') ? 2 : 3;
        return parseFloat(price).toLocaleString('RO', {
            minimumFractionDigits: decs,
            maximumFractionDigits: decs,
        });
    }

    formatNumber(value, decs) {
        return parseFloat(value).toLocaleString('RO', {
            maximumFractionDigits: decs || 2,
        });
    }
}

export default new StringsService();

import en from './strings/en';
import ro from './strings/ro';
import _ from 'lodash';

class StringsService {
    // Component where strings service instance has been initialised
    componentName;

    // Default language
    language = 'en';
    languages = {};

    // Strings map
    strings = new Map();

    constructor() {
        this.languages = { en, ro };
        this.loadStrings(this.languages[this.language]);
    }

    get(key, params = {}) {
        const value = this.strings.get(key);

        // so that everything doesn't fail without i18n
        if (!value) {
            console.warn(key);
            return key;
        }

        return this.replaceParams(value, params);
    }

    getLanguage() {
        return this.language;
    }

    setLanguage(language) {
        this.language = language;
    }

    setComponentName(name) {
        this.componentName = name;
    }

    setComponent(component) {
        this.setComponentName(component.constructor.name);
    }

    loadStrings(strings, prefix = '') {
        Object.keys(strings).forEach((key) => {
            const nextPrefix = prefix === '' ? key : `${prefix}.${key}`;
            if (typeof strings[key] === 'object') {
                this.loadStrings(strings[key], nextPrefix);
            } else {
                this.strings.set(nextPrefix, strings[key]);
            }
        });
    }

    // eslint-disable-next-line
    replaceParams(string, params) {
        let result = string;
        Object.keys(params).forEach((key) => {
            result = result.replace(`{${key}}`, params[key]);
        });

        return result;
    }

    capitalize(value) {
        value = value.split(' ').map(item => _.capitalize(item)).join(' ');
        value = value.split('-').map(item => _.capitalize(item)).join('-');

        return value;
    }

    formatPrice(price, key) {
        const decs = key.match('abonament') ? 2 : 3;
        return parseFloat(price).toLocaleString('RO', { minimumFractionDigits: decs, maximumFractionDigits: decs });
    }

    formatNumber(value, decs) {
        return parseFloat(value).toLocaleString('RO', { maximumFractionDigits: decs || 2 });
    }
}

export default new StringsService();

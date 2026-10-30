import http from 'services/http';
import auth from 'services/auth';
import levenshtein from 'fast-levenshtein';
import _ from 'lodash';
import { OCR_URL } from 'utils/config';

const PROVIDERS = [
    {
        key: 'E.ON',
        ocr: 'eon',
    }, {
        key: 'ENGIE',
        ocr: 'engie',
    }, {
        key: 'ELECTRICA',
        ocr: 'elfurnizare',
    }, {
        key: 'CEZ',
        ocr: 'cez',
    }, {
        key: 'PPC',
        ocr: 'enel',
    }, {
        key: 'E.V.A.',
        ocr: 'eva',
    }, {
        key: 'TINMAR',
        ocr: 'tinmar',
    }, {
        key: 'RCS',
        ocr: 'rcsrds',
    }, {
        key: 'MONSSON',
        ocr: 'monsson',
    }, {
        key: 'GAZ EST',
        ocr: 'gazest',
    }, {
        key: 'PREMIER',
        ocr: 'premier',
    }, {
        key: 'COVI',
        ocr: 'covi',
    }, {
        key: 'ENERGY GAS',
        ocr: 'energyg',
    }, {
        key: 'MEGACONSTRUCT',
        ocr: 'megaconst',
    }, {
        key: 'TULCEA',
        ocr: 'tulceag',
    }, {
        key: 'WIROM',
        ocr: 'wirom',
    }, {
        key: 'GAZMIR',
        ocr: 'gazmir',
    },
];

class OCRService {

    async postFiles(resource, params = {}, withResponse = false) {
        const accessToken = await auth.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken.value}` };

        const url = `${OCR_URL}${resource}`;

        const [response, data] = await http.postFiles(url, params, headers);
        if (!response.ok) {
            throw data;
        }
        return withResponse ? [response, data] : data;
    }

    getProviderOCR(provider) {
        const data = _.find(PROVIDERS, item => provider.denumire.toUpperCase().match(item.key.toUpperCase()));
        if (data) return data.ocr;
    }

    hasProviderOCR(provider) {
        return provider ? !!this.getProviderOCR(provider) : false;
    }

    matchAddress(items, name, property) {
        const PRECISION = 5;

        if (!_.isEmpty(items) && name) {
            const distances = _.map(items, item => ({
                distance: levenshtein.get(item[property].toLowerCase(), name.toLowerCase()),
                item,
            })).sort((a, b) => a.distance - b.distance);

            if (distances[0].distance <= PRECISION) {
                return distances[0].item;
            }
        }
    }
}

export default new OCRService();

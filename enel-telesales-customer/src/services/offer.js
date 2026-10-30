import _ from 'lodash';
import moment from 'moment';

class OfferService {
    getComboOffer(offers) {
        let eeOffer = _.find(offers, offer => offer.serviciu === 'EE');
        let gazOffer = _.find(offers, offer => offer.serviciu === 'GAZ');

        eeOffer = _.pickBy(eeOffer, item => !_.isNull(item));
        gazOffer = _.pickBy(gazOffer, item => !_.isNull(item));

        eeOffer.abonament_ee = eeOffer.abonament;
        eeOffer.abonament_n_ee = eeOffer.abonament_n;
        gazOffer.abonament_gaz = gazOffer.abonament;
        gazOffer.abonament_n_gaz = gazOffer.abonament_n;

        delete eeOffer.abonament;
        delete eeOffer.abonament_n;
        delete gazOffer.abonament;
        delete gazOffer.abonament_n;

        return _.assign({}, eeOffer, gazOffer, { serviciu: 'COMBO' });
    }

    getPlanDetails(plan) {
        let details = {};

        if (_.size(plan) == 1) {
            details = plan[_.keys(plan)[0]];
        } else if (_.size(plan) == 2) {
            details = this.getComboOffer(_.values(plan));
        }

        return details;
    }

    getInitialAnualQuantity(flow, county = null) {
        if (flow == 'gaz') {
            return 9000;
        }

        if (county) {
            return county.distribution.cantitate_contractata;
        }
    }

    formatNumber(value, fraction = 1) {
        return parseFloat(parseFloat(value).toFixed(2));
    }

    calculateUsage(quantity, measuredSize) {
        const perYear = this.formatNumber(quantity);
        const monthly = parseInt(quantity / 12);

        return {
            anual: perYear,
            lunar: monthly,
            ian: monthly,
            feb: monthly,
            mar: monthly,
            apr: monthly,
            mai: monthly,
            iun: monthly,
            iul: monthly,
            aug: monthly,
            sep: monthly,
            oct: monthly,
            noi: monthly,
            dec: perYear - 11 * monthly,
            marime_masurata: measuredSize,
        };
    }

    getUsage(flow, offer, quantity) {
        const usage = [];
        quantity = quantity.toString().length == 0 ? 0 : quantity;

        if (flow == 'gaz') {
            return {
                anual: this.formatNumber(parseInt(quantity)),
                lunar: this.formatNumber(parseInt(quantity) / 12),
                ian: this.formatNumber(parseInt(quantity) * 0.13),
                feb: this.formatNumber(parseInt(quantity) * 0.13),
                mar: this.formatNumber(parseInt(quantity) * 0.12),
                apr: this.formatNumber(parseInt(quantity) * 0.04),
                mai: this.formatNumber(parseInt(quantity) * 0.04),
                iun: this.formatNumber(parseInt(quantity) * 0.04),
                iul: this.formatNumber(parseInt(quantity) * 0.04),
                aug: this.formatNumber(parseInt(quantity) * 0.04),
                sep: this.formatNumber(parseInt(quantity) * 0.04),
                oct: this.formatNumber(parseInt(quantity) * 0.12),
                noi: this.formatNumber(parseInt(quantity) * 0.13),
                dec: this.formatNumber(parseInt(quantity) * 0.13),
                marime_masurata: 'GAZ',
            };
        }

        if (offer.pret_ea_n) {
            usage.push(this.calculateUsage(parseInt(quantity), 'EA'));
        }
        if (offer.pret_eaz_n) {
            usage.push(this.calculateUsage(parseInt(quantity) * 0.4, 'EAZ'));
        }
        if (offer.pret_eano_n) {
            usage.push(this.calculateUsage(parseInt(quantity) * 0.6, 'EANO'));
        }
        if (offer.pret_eanw_n) {
            usage.push(this.calculateUsage(parseInt(quantity) * 0.6, 'EANW'));
        }

        return usage;
    }

    getProviderStartDate(options = {}) {
        options.isEnelCounty = options.isEnelCounty || false;
        options.changeProvider = options.changeProvider || false;
        options.changeOwner = options.changeOwner || false;
        options.flow = options.flow ? options.flow.toLowerCase() : 'gaz';
        options.cui = options.cui || '';

        const data = moment();

        if (options.flow == 'gaz') {
            data.add('days', 35);
        } else if (options.changeProvider) {
            if (options.changeOwner) {
                if (
                    options.cui.toString() == '28909028' ||
                    options.cui.toString() == 'RO28909028' ||
                    options.cui.toString() == '29205594' ||
                    options.cui.toString() == '13996883'
                ) {
                    data.add('days', 20);
                } else {
                    data.add('days', 35);
                }
            } else {
                data.add('days', 35);
            }
        } else {
            data.add('days', 10);
        }

        return data.format('YYYY-MM-DD');
    }

    getProviderChange(options = {}) {
        let { flow, nlc, isEnelCounty, activeContract, provider } = options;
        isEnelCounty = isEnelCounty || false;
        activeContract = activeContract || false;
        provider = provider || '';
        nlc = nlc || '';
        flow = flow ? flow.toLowerCase() : 'gaz';

        if (flow == 'gaz' || (flow == 'ee' && !isEnelCounty)) {
            if (
                activeContract &&
                !provider.toLowerCase().match('enel') &&
                (nlc == 'INACTIV' || nlc == 'NOK')
            ) {
                return true;
            }
        } else if (flow == 'ee' && isEnelCounty) {
            if (activeContract && nlc == 'INACTIV') {
                return true;
            }
        }
        return false;
    }

    getOwnerChange({ nlc, cnp, userChoice }) {
        if (nlc && nlc.status === 'ACTIV') {
            return nlc.cnp != cnp;
        }
        return userChoice;
    }

    getRelevantPrices(offer, prices) {
        const PRICES = {
            pret_ea_n: 'EA',
            pret_eaz_n: 'EAZ',
            pret_eanw_n: 'EANW',
            pret_eano_n: 'EANO',
        };

        let size = null;

        _.each(PRICES, (label, key) => {
            if (offer[key] && !size) {
                size = label;
            }
        });

        return _.find(prices, price => price.marime_masurata == size);
    }

    getNextProvider(options = {}) {
        let { isEnelCounty, county, currentProvider } = options;
        isEnelCounty = isEnelCounty || false;
        county = county || null;
        currentProvider = currentProvider || null;

        let nextProvider = '';

        if (!isEnelCounty) {
            nextProvider = 430068;
        } else if (
            isEnelCounty &&
            county.distribution.companie_distributie
                .toLowerCase()
                .match('banat|dobrogea')
        ) {
            nextProvider = 430068;
        } else if (
            isEnelCounty &&
            county.distribution.companie_distributie
                .toLowerCase()
                .match('muntenia')
        ) {
            nextProvider = 430069;
        } else if (
            isEnelCounty &&
            currentProvider &&
            currentProvider.denumire.toLowerCase().match('enel')
        ) {
            nextProvider = currentProvider.internal_id;
        }

        return nextProvider;
    }

    getRythm(options = {}) {
        let { isEnelCounty, county, currentProvider, flow, provider } = options;
        isEnelCounty = isEnelCounty || false;
        county = county || null;
        currentProvider = currentProvider || null;
        flow = flow ? flow.toLowerCase() : 'gaz';
        provider = provider || '';

        if (!isEnelCounty || flow == 'gaz') {
            return 'L';
        }

        if (
            provider.toLowerCase().match('enel') &&
            county.distribution.companie_distributie
                .toLowerCase()
                .match('banat|dobrogea')
        ) {
            return 'I';
        }

        return 'L';
    }

    getAddressBySelect(session, obj) {
        const KEYS = [
            'judet',
            'localitate',
            'tip_artera',
            'strada',
            'nr_strada',
            'bloc',
            'scara',
            'apartament',
            'etaj',
            'cod_postal',
        ];
        if (obj == 'new') {
            return _.zipObject(KEYS, _.map(KEYS, () => ''));
        }
        return _(session[obj])
            .pick(KEYS)
            .mapValues(value => value || '')
            .value();
    }
}

export default new OfferService();

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

    getProviderStartDate(options = {}) {
        options.isEnelCounty = options.isEnelCounty || false;
        options.changeProvider = options.changeProvider || false;
        options.changeOwner = options.changeOwner || false;
        options.flow = options.flow ? options.flow.toLowerCase() : 'gaz';
        options.cui = options.cui || '';

        const data = moment();

        /* Temporary suspend data supply start calculation
        if (options.flow == 'gaz')
            if (options.changeOwner)
                data.add('days', 12);
            else
                data.add('days', 30);
        else if (options.changeProvider)
            if (options.changeOwner)
                data.add('days', 20);
            else
                data.add('days', 35);
        else
            data.add('days', 10); */

        data.add('days', 50);
        return data.format('YYYY-MM-DD');
    }

    getProviderChange(options = {}) {
        let {
            flow, nlc, isEnelCounty, activeContract, provider,
        } = options;
        isEnelCounty = isEnelCounty || false;
        activeContract = activeContract || false;
        provider = provider || '';
        nlc = nlc || '';
        flow = flow ? flow.toLowerCase() : 'gaz';

        if (
            activeContract &&
            !provider.toLowerCase().match('enel') &&
            (nlc == 'INACTIV' || nlc == 'NOK')
        ) {
            return true;
        } else if (
            activeContract &&
            provider.toLowerCase().match('enel') &&
            (nlc == 'INACTIV' || nlc == 'NOK')
        ) {
            return false;
        }
        return false;
    }

    getOwnerChange({ nlc, cnp_cui, userChoice, isValidPOD }) {

        if (nlc && nlc.status === 'ACTIV') {
            return nlc.cnp_cui != cnp_cui;
        } else if (nlc && nlc.status === 'NOK') {
            return false;
        }
        if (!isValidPOD) return false;
        return userChoice;
    }

    getRelevantPrices(offer, prices) {
        const PRICES = {
            pret_ea_n: 'EA',
            // pret_eaz_n: 'EAZ',
            // pret_eanw_n: 'EANW',
            // pret_eano_n: 'EANO',
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
        let {
            nlc, isEnelCounty, county, currentProvider,
        } = options;
        isEnelCounty = isEnelCounty || false;
        county = county || null;
        currentProvider = currentProvider || null;
        nlc = nlc || '';

        if (nlc == 'ACTIV' && currentProvider) {
            return currentProvider.internal_id;
        }

        let nextProvider = '';

        if (!isEnelCounty) {
            nextProvider = 'T_RO22000460';
        } else if (isEnelCounty && county.distribution.companie_distributie.toLowerCase().match('banat|dobrogea')) {
            nextProvider = 'T_RO22000460';
        } else if (isEnelCounty && county.distribution.companie_distributie.toLowerCase().match('muntenia')) {
            nextProvider = 'T_RO22000460';
        } else if (isEnelCounty && currentProvider && currentProvider.denumire.toLowerCase().match('enel')) {
            nextProvider = currentProvider.internal_id;
        }

        return nextProvider;
    }

    getRythm(options = {}) {
        let {
            isEnelCounty, county, currentProvider, flow, provider,
        } = options;
        isEnelCounty = isEnelCounty || false;
        county = county || null;
        currentProvider = currentProvider || null;
        flow = flow ? flow.toLowerCase() : 'gaz';
        provider = provider || '';

        if (!isEnelCounty || flow == 'gaz') {
            return 'L';
        }

        if (provider.toLowerCase().match('enel') && county.distribution.companie_distributie.toLowerCase().match('banat|dobrogea')) {
            return 'I';
        }

        return 'L';
    }

    getAddressBySelect(session, obj) {
        const KEYS = ['judet', 'localitate', 'tip_artera', 'strada', 'nr_strada', 'bloc', 'scara', 'apartament', 'etaj', 'cod_postal'];
        if (obj == 'new') {
            return _.zipObject(KEYS, _.map(KEYS, () => ''));
        }
        return _(session.contract_type === 'b2b' && obj === 'client' ? session['company']['address'] : session[obj]).pick(KEYS).mapValues(value => value || '').value();
    }
}

export default new OfferService();

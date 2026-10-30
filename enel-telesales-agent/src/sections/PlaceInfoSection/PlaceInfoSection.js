import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import Section from 'components/Section';
import { Form, FormErrors, Text } from 'components/form';
import pageService from 'services/page';
import moment from 'moment';
import _ from 'lodash';

import * as providersSelectors from 'store/providers/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getItems as getDistributors } from 'store/distributors/selectors';
import {
    getClient,
    getNLC,
    getNLCValidation,
    getStartDate,
    isLinkSent,
} from 'store/client/selectors';
import { getSession, getFlow, getContractType, isContractSent } from 'store/session/selectors';
import { fetchDocs, deleteDoc } from 'store/documents/actions';
import { getDocs } from 'store/documents/selectors';
import { getCurrentPlan, isPlanSelected } from 'store/offers/selectors';

import * as providersActions from 'store/providers/actions';
import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { queryIndexes } from 'store/measurementIndexes/actions';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { fetchAllItems as fetchDistributors } from 'store/distributors/actions';
import {
    checkNLC,
    checkOfferStatus,
    checkStartDate,
    clearNLC,
    validateNLC,
} from 'store/client/actions';
import {
    create as createSession,
    fetchItem as fetchSession,
    patch as patchSession,
    rejectOffer,
    setProvider,
} from 'store/session/actions';

import PodBody from 'sections/PlaceInfoSection/components/PodBody';
import ConfirmModal from 'components/modals/ConfirmModal';

import { requiredBefore } from 'services/rules';
import { addFormError, checkForm, getFromForm, noFormErrors, resetFormErrors } from 'services/form';
import offerService from 'services/offer';
import strings from 'services/strings';
import ApiService from '../../services/api';

import { Button } from 'components/Button';

import './PlaceInfoSection.scss';
import InvalidIndexesPopup from './InvalidIndexesPopup';

const EE = 'T_RO22000460';
const EEM = 'T_RO24387371';

const ENEL_AREAS = {
    BUCURESTI: EEM,
    ILFOV: EEM,
    GIURGIU: EEM,
    CALARASI: EE,
    CONSTANTA: EE,
    IALOMITA: EE,
    TULCEA: EE,
    ARAD: EE,
    'CARAS-SEVERIN': EE,
    HUNEDOARA: EE,
    TIMIS: EE,
};

class PlaceInfoSection extends Component {
    static propTypes = {
        onNextClick: PropTypes.func.isRequired,
    };

    formErrors = {
        provider: [],
        'pod-0': [],
    };

    podTemplate = {
        code: '',
        expand: false,
        active: false,
        showNLC: false,
        disableNLC: false,
        deleted: false,
    };

    state = {
        pods: [this.podTemplate],
        isValid: true,
        isAnualConsumptionValid: true,
        isPlaceStatementChecked: false,
        formErrors: this.formErrors,
        showIndexesErrorModal: false,
        docs: {},
        dataLoaded: false,
        currentIndex: 0,
        'docValidity-0': null,
        'perYear-0': 0,
        'rataUnica-0': 0,
        'zonaVarf-0': 0,
        'zonaRest-0': 0,
        'zonaGol-0': 0,
        'reactivaInductiva-0': 0,
        'reactivaCapacitativa-0': 0,
        'volumMasurat-0': 0,
        'distributorId-0': '',
        invalidInputFields: [],
        continueWithoutValidation: false,
    };

    deleteCodeModal = React.createRef();
    consumptionPlaceActive = React.createRef();
    anualConsumptionValidation = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
        this.indexesErrorModal = React.createRef();
    }

    componentDidMount() {
        this.props.onMount(this);
        this.props.fetchDistributors();
        this.props.fetchProviders();
    }

    async componentDidUpdate(prevProps) {
        const { session, isEdit, counties } = this.props;
        if (isEdit) {
            if (!_.isEmpty(session) && this.formApi && !this.state.dataLoaded && _.size(counties)) {
                this.setState({ dataLoaded: true });
                await this.props.clearNLC();
                await this.loadSessionPlace(0);
                await this.loadSessionPlace(1);
                await this.setValues(0);
                await this.setValues(1);
                this.loadSessionNLC(0);
                this.loadSessionNLC(1);
                this.loadSessionConsumption(0);
                this.loadSessionConsumption(1);
            }
        }

        if (this.formApi && !prevProps.isLinkSent && this.props.isLinkSent) {
            if (this.shouldRenderPlaceDocs(0)) {
                await this.loadStartDate(0);
                await this.setValidity(0);
            }
            if (this.shouldRenderPlaceDocs(1)) {
                await this.loadStartDate(1);
                await this.setValidity(1);
            }
        }
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    async loadSessionPlace(index) {
        const { session } = this.props;
        const isCombo = !_.isEmpty(session.ee_loc) && !_.isEmpty(session.gaz_loc);
        let flow = isCombo ? (index === 1 ? 'gaz' : 'ee') : '';
        if (!flow && !_.isEmpty(session.ee_loc)) flow = 'ee';
        if (!flow && !_.isEmpty(session.gaz_loc)) flow = 'gaz';
        if (!flow) return;

        const place = session[`${flow}_loc`];
        if (index === 1 && !isCombo) {
            return;
        }
        if (place.cod_pod) {
            await this.props.validateNLC(place.cod_pod);
            await this.props.checkNLC(place.cod_pod);

            const nlc = this.props.nlc[place.cod_pod];
            if (nlc && nlc.codeENELTEL) {
                await this.props.queryIndexes(nlc.codeENELTEL);
            }
        }

        await this.checkPod(index);
        await this.updatePod(index, 'expand', true);

        const data = _.transform(place, (result, value, key) => {
            result[`loc_${key}-${index}`] = value;
        });

        if (place.judet) {
            await this.props.fetchCities(place.judet);
            this.formApi.setValue(`loc_judet-${index}`, place.judet);
            if (place.localitate) {
                await this.props.fetchStreets(place.localitate);
                this.formApi.setValue(`loc_localitate-${index}`, place.localitate);
                this.setState({ cityLoaded: true }, () => {
                    this.formApi.setValue(`loc_strada-${index}`, place.strada);
                    this.formApi.setValue(`loc_tip_artera-${index}`, place.tip_artera);
                    this.formApi.setValue(`loc_nr_strada-${index}`, place.nr_strada);
                });
            }
        }

        if (place.cod_pod) {
            this.formApi.setValue(`loc_cod_pod-${index}`, place.cod_pod);
            await this.updatePod(index, 'code', place.cod_pod);
        }

        this.setState({ dataLoaded: true }, () => {
            if (place.index && place.data_reziliere) {
                this.formApi.setValue(
                    `loc_data_reziliere-${index}`,
                    moment(place.data_reziliere, 'YYYY-MM-DD').format('DD.MM.YYYY')
                );
                this.setState({ indexLoaded: true });
            }
        });

        if (session[`${flow}_are_furnizare_activa`]) {
            await this.handleActiveChange({ target: { value: true } }, index);
        }

        this.formApi.setValues({
            [`are_furnizare_activa-${index}`]: session[`${flow}_are_furnizare_activa`],
            [`furnizor_actual-${index}`]: place.furnizor_id,
            [`schimba_titular-${index}`]: session[`${flow}_schimba_titular`],
        });

        // load place doc validity
        if (this.shouldRenderPlaceDocs(index)) {
            if (session[`${flow}_loc_doc`] && session[`${flow}_loc_doc`].valabilitate) {
                this.formApi.setValue(`tip_valabilitate-${index}`, true);
                this.setState({ validityLoaded: true }, () => {
                    const docValidity = moment(
                        session[`${flow}_loc_doc`].valabilitate,
                        'YYYY-MM-DD'
                    ).format('DD.MM.YYYY');
                    this.formApi.setValue(`valabilitate-${index}`, docValidity);
                    this.setState({ [`docValidity-${index}`]: docValidity });
                });
            } else {
                this.formApi.setValue(`tip_valabilitate-${index}`, false);
                this.setState({ [`docValidity-${index}`]: null });
            }
        }

        // load provider start date
        if (session[`${flow}_furnizor_data_start`]) {
            this.formApi.setValue(
                `furnizor_data_start-${index}`,
                moment(session[`${flow}_furnizor_data_start`], 'YYYY-MM-DD').format('DD.MM.YYYY')
            );
        }

        // load provider start date
        if (place.declaratie_act_spatiu) {
            this.setState({ isPlaceStatementChecked: place.declaratie_act_spatiu });
        }

        // load contract number
        if (this.shouldRenderContractNumber(index)) {
            this.formApi.setValue(
                `loc_nr_contract_actual-${index}`,
                data[`loc_nr_contract_actual-${index}`]
            );
        }
        if (this.props.measurementIndexes.INDEXES) {
            this.props.measurementIndexes.INDEXES.forEach(indexItem => {
                this.formApi.setValue(
                    `index-actual-${indexItem.ID_CADRAN}-${index}`,
                    indexItem.INDEX
                );
            });
        }
    }

    loadSessionNLC(index) {
        const { session } = this.props;
        const isCombo = !_.isEmpty(session.ee_loc) && !_.isEmpty(session.gaz_loc);
        let flow = isCombo ? (index === 1 ? 'gaz' : 'ee') : '';
        if (!flow && !_.isEmpty(session.ee_loc)) flow = 'ee';
        if (!flow && !_.isEmpty(session.gaz_loc)) flow = 'gaz';
        if (!flow) return;

        const place = session[`${flow}_loc`];
        if (index === 1 && !isCombo) {
            return;
        }

        if (place.distribuitor_id) {
            this.formApi.setValue(`loc_distribuitor_id-${index}`, place.distribuitor_id);
            this.setState({ [`distributorId-${index}`]: place.distribuitor_id });
        }

        if (place.nlc) {
            try {
                this.formApi.setValue(`loc_nlc-${index}`, place.nlc);
            } catch (e) {}
        }
    }

    loadSessionConsumption(index) {
        const { session } = this.props;
        const isCombo = !_.isEmpty(session.ee_loc) && !_.isEmpty(session.gaz_loc);
        let flow = isCombo ? (index === 1 ? 'gaz' : 'ee') : '';
        if (!flow && !_.isEmpty(session.ee_loc)) flow = 'ee';
        if (!flow && !_.isEmpty(session.gaz_loc)) flow = 'gaz';
        if (!flow) return;

        const place = session[`${flow}_loc`];
        const indexes = session['measurement_indexes'];
        if (index === 1 && !isCombo) {
            return;
        }

        if (place.categorie) {
            this.formApi.setValue(`loc_categorie-${index}`, place.categorie);
        }

        if (place.pressure && place.presureLevel) {
            this.formApi.setValue(`loc_pressure-${index}`, place.pressure);
            this.formApi.setValue(`loc_presureLevel-${index}`, place.presureLevel);
        }

        if (session.ee_putere_avizata) {
            this.formApi.setValue(`putere_avizata-${index}`, session.ee_putere_avizata);
        }

        if (place.cantitate_anuala) {
            this.formApi.setValue(`loc_cantitate_anuala-${index}`, place.cantitate_anuala);
            this.setState({ [`perYear-${index}`]: place.cantitate_anuala });
            this.setMonthValues(index);
        }

        if (
            (flow === 'gaz' && session[`${flow}_consum`]) ||
            (flow === 'ee' && session[`${flow}_consum`] && session[`${flow}_consum`][0])
        ) {
            let usage;
            if (flow === 'gaz') {
                usage = session[`${flow}_consum`];
            } else if (session[`${flow}_consum`][0]) {
                usage = session[`${flow}_consum`][0];
            }
            this.formApi.setValues({
                [`ianuarie-${index}`]: strings.formatNumber(usage.ian),
                [`februarie-${index}`]: strings.formatNumber(usage.feb),
                [`martie-${index}`]: strings.formatNumber(usage.mar),
                [`aprilie-${index}`]: strings.formatNumber(usage.apr),
                [`mai-${index}`]: strings.formatNumber(usage.mai),
                [`iunie-${index}`]: strings.formatNumber(usage.iun),
                [`iulie-${index}`]: strings.formatNumber(usage.iul),
                [`august-${index}`]: strings.formatNumber(usage.aug),
                [`septembrie-${index}`]: strings.formatNumber(usage.sep),
                [`octombrie-${index}`]: strings.formatNumber(usage.oct),
                [`noiembrie-${index}`]: strings.formatNumber(usage.noi),
                [`decembrie-${index}`]: strings.formatNumber(usage.dec),
            });
        }

        if (indexes) {
            Object.keys(indexes).forEach(key => {
                const indexName = `meas_index_${key}-${index}`;
                const indexValue = indexes[key];
                this.formApi.setValue(indexName, indexValue);
            });
        }
    }

    calculateUsageData(coefficient, measuredSize, index) {
        const { flow } = this.props;
        const perYear = this.formApi.getValue(`loc_cantitate_anuala-${index}`);

        return {
            anual: parseInt(perYear),
            lunar:
                flow === 'gaz' ? Math.round((perYear / 12) * 100) / 100 : Math.round(perYear / 12),
            ian:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`ianuarie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            feb:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`februarie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            mar:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`martie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            apr:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`aprilie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            mai:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`mai-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            iun:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`iunie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            iul:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`iulie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            aug:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`august-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            sep:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`septembrie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            oct:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`octombrie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            noi:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`noiembrie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            dec:
                Math.round(
                    parseFloat(
                        this.formApi
                            .getValue(`decembrie-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    ) *
                        coefficient *
                        100
                ) / 100,
            marime_masurata: measuredSize,
        };
    }

    getUsage(flow, offer, quantity = '', calculateOnly, index) {
        const usage = [];
        quantity = !quantity ? 0 : quantity;

        if (calculateOnly) {
            if (flow === 'gaz') {
                const months = [
                    'ian',
                    'feb',
                    'mar',
                    'apr',
                    'mai',
                    'iun',
                    'iul',
                    'aug',
                    'sep',
                    'oct',
                    'noi',
                    'dec',
                ];
                const obj = {
                    ian: Math.round(parseInt(quantity) * 0.13),
                    feb: Math.round(parseInt(quantity) * 0.13),
                    mar: Math.round(parseInt(quantity) * 0.12),
                    apr: Math.round(parseInt(quantity) * 0.04),
                    mai: Math.round(parseInt(quantity) * 0.04),
                    iun: Math.round(parseInt(quantity) * 0.04),
                    iul: Math.round(parseInt(quantity) * 0.04),
                    aug: Math.round(parseInt(quantity) * 0.04),
                    sep: Math.round(parseInt(quantity) * 0.04),
                    oct: Math.round(parseInt(quantity) * 0.12),
                    noi: Math.round(parseInt(quantity) * 0.13),
                    dec: Math.round(parseInt(quantity) * 0.13),
                };

                months.reverse().forEach(el => {
                    const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                    const dif = quantity - sumValues(obj);
                    const res = obj[el] + dif;
                    if (res < 0) obj[el] = 0;
                    else obj[el] = res;
                });
                return obj;
            } else {
                const months = [
                    'ian',
                    'feb',
                    'mar',
                    'apr',
                    'mai',
                    'iun',
                    'iul',
                    'aug',
                    'sep',
                    'oct',
                    'noi',
                    'dec',
                ];

                const monthly = Math.floor(parseInt(quantity) / 12);
                const judet = this.formApi.getValue(`loc_judet-${index}`);

                const banatJudets = [
                    'arad',
                    'caras-severin',
                    'hunedoara',
                    'timis',
                    'arad',
                    'caras-severin',
                    'hunedoara',
                    'timis',
                ];

                const dobrogeaJudets = [
                    'calarasi',
                    'constanta',
                    'ialomita',
                    'tulcea',
                    'calarasi',
                    'constanta',
                    'ialomita',
                    'tulcea',
                ];

                const munteniaJudets = [
                    'bucuresti',
                    'giurgiu',
                    'ilfov',
                    'bucuresti',
                    'giurgiu',
                    'ilfov',
                ];

                if (banatJudets.includes(judet.toLowerCase())) {
                    if (this.props.session.contract_type === 'b2c') {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.0983),
                            feb: Math.round(parseInt(quantity) * 0.0837),
                            mar: Math.round(parseInt(quantity) * 0.0869),
                            apr: Math.round(parseInt(quantity) * 0.0813),
                            mai: Math.round(parseInt(quantity) * 0.0784),
                            iun: Math.round(parseInt(quantity) * 0.0764),
                            iul: Math.round(parseInt(quantity) * 0.0802),
                            aug: Math.round(parseInt(quantity) * 0.0803),
                            sep: Math.round(parseInt(quantity) * 0.0718),
                            oct: Math.round(parseInt(quantity) * 0.0795),
                            noi: Math.round(parseInt(quantity) * 0.0851),
                            dec: Math.round(parseInt(quantity) * 0.0981),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    } else {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.1016),
                            feb: Math.round(parseInt(quantity) * 0.0895),
                            mar: Math.round(parseInt(quantity) * 0.088),
                            apr: Math.round(parseInt(quantity) * 0.0743),
                            mai: Math.round(parseInt(quantity) * 0.0716),
                            iun: Math.round(parseInt(quantity) * 0.0735),
                            iul: Math.round(parseInt(quantity) * 0.0801),
                            aug: Math.round(parseInt(quantity) * 0.0791),
                            sep: Math.round(parseInt(quantity) * 0.0752),
                            oct: Math.round(parseInt(quantity) * 0.0837),
                            noi: Math.round(parseInt(quantity) * 0.0889),
                            dec: Math.round(parseInt(quantity) * 0.0945),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    }
                } else if (dobrogeaJudets.includes(judet.toLowerCase())) {
                    if (this.props.session.contract_type === 'b2c') {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.0962),
                            feb: Math.round(parseInt(quantity) * 0.0832),
                            mar: Math.round(parseInt(quantity) * 0.0858),
                            apr: Math.round(parseInt(quantity) * 0.0805),
                            mai: Math.round(parseInt(quantity) * 0.0736),
                            iun: Math.round(parseInt(quantity) * 0.0749),
                            iul: Math.round(parseInt(quantity) * 0.0894),
                            aug: Math.round(parseInt(quantity) * 0.0927),
                            sep: Math.round(parseInt(quantity) * 0.0706),
                            oct: Math.round(parseInt(quantity) * 0.0744),
                            noi: Math.round(parseInt(quantity) * 0.0824),
                            dec: Math.round(parseInt(quantity) * 0.0963),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    } else {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.0961),
                            feb: Math.round(parseInt(quantity) * 0.0853),
                            mar: Math.round(parseInt(quantity) * 0.0844),
                            apr: Math.round(parseInt(quantity) * 0.0742),
                            mai: Math.round(parseInt(quantity) * 0.0687),
                            iun: Math.round(parseInt(quantity) * 0.0766),
                            iul: Math.round(parseInt(quantity) * 0.0949),
                            aug: Math.round(parseInt(quantity) * 0.0969),
                            sep: Math.round(parseInt(quantity) * 0.0769),
                            oct: Math.round(parseInt(quantity) * 0.0749),
                            noi: Math.round(parseInt(quantity) * 0.082),
                            dec: Math.round(parseInt(quantity) * 0.0891),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    }
                } else if (munteniaJudets.includes(judet.toLowerCase())) {
                    if (this.props.session.contract_type === 'b2c') {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.0952),
                            feb: Math.round(parseInt(quantity) * 0.0814),
                            mar: Math.round(parseInt(quantity) * 0.084),
                            apr: Math.round(parseInt(quantity) * 0.0769),
                            mai: Math.round(parseInt(quantity) * 0.073),
                            iun: Math.round(parseInt(quantity) * 0.0766),
                            iul: Math.round(parseInt(quantity) * 0.0897),
                            aug: Math.round(parseInt(quantity) * 0.0904),
                            sep: Math.round(parseInt(quantity) * 0.0713),
                            oct: Math.round(parseInt(quantity) * 0.0795),
                            noi: Math.round(parseInt(quantity) * 0.0851),
                            dec: Math.round(parseInt(quantity) * 0.0969),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    } else {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.1021),
                            feb: Math.round(parseInt(quantity) * 0.0907),
                            mar: Math.round(parseInt(quantity) * 0.0885),
                            apr: Math.round(parseInt(quantity) * 0.0744),
                            mai: Math.round(parseInt(quantity) * 0.0675),
                            iun: Math.round(parseInt(quantity) * 0.0731),
                            iul: Math.round(parseInt(quantity) * 0.0828),
                            aug: Math.round(parseInt(quantity) * 0.083),
                            sep: Math.round(parseInt(quantity) * 0.0743),
                            oct: Math.round(parseInt(quantity) * 0.0794),
                            noi: Math.round(parseInt(quantity) * 0.088),
                            dec: Math.round(parseInt(quantity) * 0.0962),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    }
                } else {
                    if (this.props.session.contract_type === 'b2c') {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.0967),
                            feb: Math.round(parseInt(quantity) * 0.0829),
                            mar: Math.round(parseInt(quantity) * 0.0857),
                            apr: Math.round(parseInt(quantity) * 0.0798),
                            mai: Math.round(parseInt(quantity) * 0.0752),
                            iun: Math.round(parseInt(quantity) * 0.0759),
                            iul: Math.round(parseInt(quantity) * 0.0861),
                            aug: Math.round(parseInt(quantity) * 0.0876),
                            sep: Math.round(parseInt(quantity) * 0.0712),
                            oct: Math.round(parseInt(quantity) * 0.0776),
                            noi: Math.round(parseInt(quantity) * 0.0841),
                            dec: Math.round(parseInt(quantity) * 0.0972),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    } else {
                        const obj = {
                            ian: Math.round(parseInt(quantity) * 0.1018),
                            feb: Math.round(parseInt(quantity) * 0.09),
                            mar: Math.round(parseInt(quantity) * 0.0882),
                            apr: Math.round(parseInt(quantity) * 0.0743),
                            mai: Math.round(parseInt(quantity) * 0.0698),
                            iun: Math.round(parseInt(quantity) * 0.0733),
                            iul: Math.round(parseInt(quantity) * 0.0813),
                            aug: Math.round(parseInt(quantity) * 0.0808),
                            sep: Math.round(parseInt(quantity) * 0.0748),
                            oct: Math.round(parseInt(quantity) * 0.0819),
                            noi: Math.round(parseInt(quantity) * 0.0885),
                            dec: Math.round(parseInt(quantity) * 0.0953),
                        };
                        months.reverse().forEach(el => {
                            const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
                            const dif = quantity - sumValues(obj);
                            const res = obj[el] + dif;
                            if (res < 0) obj[el] = 0;
                            else obj[el] = res;
                        });
                        return obj;
                    }
                }

                // return {
                //     ian: monthly,
                //     feb: monthly,
                //     mar: monthly,
                //     apr: monthly,
                //     mai: monthly,
                //     iun: monthly,
                //     iul: monthly,
                //     aug: monthly,
                //     sep: monthly,
                //     oct: monthly,
                //     noi: monthly,
                //     dec: parseInt(quantity) - 11 * monthly,
                // };
            }
        }

        if (flow === 'gaz') {
            return this.calculateUsageData(1, 'GAZ', index);
        }

        // if (offer.pret_ea_n) {
        //we add this by default for electricity
        usage.push(this.calculateUsageData(1, 'EA', index));
        // }
        if (offer) {
            if (offer.pret_eaz_n) {
                usage.push(this.calculateUsageData(0.4, 'EAZ', index));
            }
            if (offer.pret_eano_n) {
                usage.push(this.calculateUsageData(0.6, 'EANO', index));
            }
            if (offer.pret_eanw_n) {
                usage.push(this.calculateUsageData(0.6, 'EANW', index));
            }
        }
        return usage;
    }

    async loadStartDate(index) {
        return new Promise(async resolve => {
            const { session } = this.props;
            const isCombo = !_.isEmpty(session.ee_loc) && !_.isEmpty(session.gaz_loc);
            if (index === 1 && !isCombo) {
                return resolve();
            }

            await this.checkPod(index);
            const flow = this.getFlow(index);

            if (session[`${flow}_furnizor_data_start`]) {
                this.formApi.setValue(
                    `furnizor_data_start-${index}`,
                    moment(session[`${flow}_furnizor_data_start`], 'YYYY-MM-DD').format(
                        'DD.MM.YYYY'
                    )
                );
            }
            resolve();
        });
    }

    async getStartDate(index) {
        const { counties } = this.props;
        const { values } = this.formApi.getState();
        const flow = this.getFlow(index);
        const county = _.find(counties, item => item.denumire === values[`loc_judet-${index}`]);
        const isEnelCounty =
            !_.isNil(county) &&
            county.distribution &&
            !_.isNil(county.distribution.distributie_enel) &&
            county.distribution.distributie_enel === 'D';
        const currentProvider = _.find(
            this.props[`${flow}Providers`],
            item => item.internal_id === values[`furnizor_actual-${index}`]
        );
        const podCode = this.state.pods[index].code;
        const isWinback =
            this.props.nlc[podCode] &&
            this.props.nlc[podCode].status &&
            this.props.nlc[podCode].status === 'INACTIV';
        const isPR =
            this.props.nlc[podCode] &&
            this.props.nlc[podCode].piata &&
            this.props.nlc[podCode].piata === 'PR';

        await this.props.checkStartDate({
            type: flow,
            isEnelCounty,
            changeProvider: this.getProviderChange(index),
            changeOwner: this.formApi.getValue(`schimba_titular-${index}`),
            cui: currentProvider ? currentProvider.cui : null,
            isWinback: isWinback,
            isPR: isPR,
        });
        return this.props.startDate;
    }

    // getNextProvider(index) {
    //     const {counties} = this.props;
    //     const {values} = this.formApi.getState();
    //     const flow = this.getFlow(index);
    //     const pod = this.state.pods[index];
    //     const nlc = this.props.nlc[pod.code];
    //     const county = _.find(counties, item => item.denumire === values[`loc_judet-${index}`]);
    //     const isEnelCounty =
    //         !_.isNil(county) &&
    //         county.distribution &&
    //         !_.isNil(county.distribution.distributie_enel) &&
    //         county.distribution.distributie_enel === 'D';
    //     const currentProvider = _.find(
    //         this.props[`${flow}Providers`],
    //         item => item.internal_id === values[`furnizor_actual-${index}`]
    //     );
    //
    //     return offerService.getNextProvider({
    //         county,
    //         flow,
    //         nlc: nlc ? nlc.status : null,
    //         isEnelCounty,
    //         currentProvider,
    //     });
    // }

    getProviderChange(index) {
        const { counties } = this.props;
        const { values } = this.formApi.getState();
        const flow = this.getFlow(index);
        const pod = this.state.pods[index];
        const nlc = this.props.nlc[pod.code];
        const county = _.find(counties, item => item.denumire === values[`loc_judet-${index}`]);
        const isEnelCounty =
            !_.isNil(county) &&
            county.distribution &&
            !_.isNil(county.distribution.distributie_enel) &&
            county.distribution.distributie_enel === 'D';
        const currentProvider = _.find(
            this.props[`${flow}Providers`],
            item => item.internal_id === values[`furnizor_actual-${index}`]
        );

        return offerService.getProviderChange({
            flow,
            isEnelCounty,
            nlc: nlc ? nlc.status : null,
            activeContract: values[`are_furnizare_activa-${index}`],
            provider: currentProvider ? currentProvider.denumire : null,
        });
    }

    getPods() {
        return this.state.pods.filter(item => !item.deleted);
    }

    getFlow(index) {
        const { nlcValidation } = this.props;
        const { code } = this.state.pods[index];
        if (nlcValidation[code] && nlcValidation[code].type) {
            return nlcValidation[code].type.toLowerCase();
        }
    }

    getNLCInfo(index) {
        const { nlc } = this.props;
        const { code } = this.state.pods[index];
        return nlc[code] || {};
    }

    getPlaceAddress(index) {
        const { values } = this.formApi.getState();
        const { counties, cities, streets } = this.props;
        const county = _.find(counties, item => item.denumire === values[`loc_judet-${index}`]);
        const city = _.find(cities, item => item.internal_id === values[`loc_localitate-${index}`]);
        const street = _.find(streets, item => item.internal_id === values[`loc_strada-${index}`]);
        return {
            county,
            city: city ? city.denumire : null,
            streetType: values[`loc_tip_artera-${index}`],
            street: street ? street.denumire : null,
            streetNo: values[`loc_nr_strada-${index}`],
            building: values[`loc_bloc-${index}`],
            entrance: values[`loc_scara-${index}`],
            floor: values[`loc_etaj-${index}`],
            apartment: values[`loc_apartament-${index}`],
        };
    }

    getLabel(index) {
        const flow = this.getFlow(index);
        if (flow) {
            return flow === 'gaz' ? 'CLC' : 'POD';
        }
        return 'POD/CLC';
    }

    getNLCType(index) {
        const flow = this.getFlow(index);
        if (flow === 'gaz') {
            return 'CLC';
        }

        if (this.formApi) {
            const county = _.find(
                this.props.counties,
                item => item.denumire === this.formApi.getValue(`loc_judet-${index}`)
            );
            if (county) {
                if (
                    county &&
                    county.distribution &&
                    !_.isNil(county.distribution.distributie_enel) &&
                    county.distribution.distributie_enel === 'D'
                ) {
                    return 'POD';
                }
            }
        }

        return 'NLC';
    }

    shouldRenderContractNumber(index) {
        const { session } = this.props;
        const flow = this.getFlow(index);
        if (
            flow &&
            this.formApi.getValue(`are_furnizare_activa-${index}`) === true &&
            // this.formApi.getValue(`furnizor_actual-${index}`) !== '' &&
            this.formApi.getValue(`schimba_titular-${index}`) != undefined
        ) {
            return false;
        }
        if (flow && session[`${flow}_schimba_furnizor`] && !session[`${flow}_schimba_titular`]) {
            return true;
        } else if (this.formApi) {
            return (
                this.getProviderChange(index) === true &&
                this.formApi.getValue(`schimba_titular-${index}`) === false
            );
        }
        return false;
    }

    shouldRenderPlaceDocs(index) {
        const { session, counties } = this.props;
        const pod = this.state.pods[index];
        if (!pod || !pod.code) return false;
        const nlc = this.props.nlc[pod.code];
        const flow = this.getFlow(index);
        const county = _.find(
            counties,
            item => item.denumire === this.formApi.getValue(`loc_judet-${index}`)
        );

        if (nlc) {
            const isEnelCounty =
                county &&
                county.distribution &&
                !_.isNil(county.distribution.distributie_enel) &&
                county.distribution.distributie_enel === 'D';
            const changeOwner = session[`${flow}_schimba_titular`];

            return !(
                isEnelCounty &&
                nlc.piata === 'PR' &&
                !changeOwner &&
                nlc.cnp_cui &&
                nlc.status !== 'INACTIV'
            );
        }

        return false;
    }

    checkPod(index) {
        return new Promise(resolve => {
            if (!this.state.pods[index]) {
                const pods = [...this.state.pods];
                pods[index] = this.podTemplate;
                this.setState(
                    {
                        pods,
                        [`perYear-${index}`]: 0,
                        [`distributorId-${index}`]: '',
                    },
                    resolve
                );
            } else {
                resolve();
            }
        });
    }

    updatePod(index, property, value) {
        return new Promise(resolve => {
            const pods = [...this.state.pods];
            pods[index] = {
                ...pods[index],
                [property]: value,
            };
            this.setState({ pods }, resolve);
        });
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    async setValues(index, skipComboValidation) {
        return new Promise(async resolve => {
            const { props } = this;
            const isCombo = !_.isEmpty(props.session.ee_loc) && !_.isEmpty(props.session.gaz_loc);
            if (!skipComboValidation && index === 1 && !isCombo) {
                return resolve();
            }

            await this.checkPod(index);
            const { code } = this.state.pods[index];
            if (!code) {
                resolve();
            }

            const nlc = this.props.nlc[code];
            const nlcValidation = props.nlcValidation[code];
            const flow = this.getFlow(index);
            let distributor = null;
            let nlcValidationDistributor = null;

            if (
                nlc &&
                nlcValidation &&
                nlcValidation.distributor &&
                nlcValidation.distributor.internal_id
            ) {
                nlcValidationDistributor = nlcValidation.distributor.internal_id;
            }

            if (flow === 'ee') {
                if (nlc && nlc.distributorId) {
                    distributor = _.find(
                        props.distributors,
                        item => item.internal_id === nlc.distributorId
                    );
                } else if (nlcValidationDistributor) {
                    distributor = _.find(
                        props.distributors,
                        item => item.internal_id === nlcValidationDistributor
                    );
                } else {
                    const county = _.find(
                        props.counties,
                        item => item.denumire === props.session.judet
                    );

                    if (county && county.distribution) {
                        distributor = _.find(
                            props.distributors,
                            item => item.internal_id === county.distribution.id_enel
                        );
                    }
                }
            } else {
                distributor = _.find(
                    props.distributors,
                    item => item.internal_id === nlcValidationDistributor
                );
            }

            await this.loadNLCCode(index);
            await this.setConsumption(index);
            if (distributor) {
                this.formApi.setValue(`loc_distribuitor_id-${index}`, distributor.internal_id);
                this.setState({ [`distributorId-${index}`]: distributor.internal_id }, resolve);
            } else {
                resolve();
            }
        });
    }

    async setStartDate(index) {
        const startDate = moment(await this.getStartDate(index), 'YYYY-MM-DD');
        this.formApi.setValue(`furnizor_data_start-${index}`, startDate.format('DD.MM.YYYY'));

        if (this.formApi) {
            const statementChecked = this.formApi.getValue(`loc_declaratie_act_spatiu-${index}`);
            if (statementChecked) {
                try {
                    const docValidity = startDate.add(12, 'months').format('DD.MM.YYYY');
                    this.formApi.setValue(`valabilitate-${index}`, docValidity);
                    this.setState({ [`docValidity-${index}`]: docValidity });
                } catch (err) {}
            }
        }

        this.setState({ update: true });
    }

    async setConsumption(index) {
        await this.checkPod(index);
        const { props } = this;
        const flow = this.getFlow(index);
        const county = _.find(
            props.counties,
            item => item.denumire === this.formApi.getValue(`loc_judet-${index}`)
        );

        if (county) {
            const perYear = offerService.getInitialAnualQuantity(flow, county);
            if (perYear) {
                if (this.props.contractType !== 'b2b') {
                    this.formApi.setValue(`loc_cantitate_anuala-${index}`, perYear);
                    this.handleQuantityChange(perYear, index);
                }
                if (flow === 'gaz') {
                    this.formApi.setValue(`loc_categorie-${index}`, 'C1');
                }
            }
        }
    }

    async setDefaultAddress(index) {
        const { values } = this.formApi.getState();
        if (values['loc_judet-0']) {
            this.formApi.setValue(`loc_judet-${index}`, values['loc_judet-0']);
            await this.handleCountyChange(
                { target: { value: values['loc_judet-0'] } },
                'loc_',
                index
            );

            if (values['loc_localitate-0']) {
                this.formApi.setValue(`loc_localitate-${index}`, values['loc_localitate-0']);
                await this.handleCityChange(
                    { target: { value: values['loc_localitate-0'] } },
                    'loc_',
                    index
                );

                if (values['loc_strada-0']) {
                    this.formApi.setValue(`loc_strada-${index}`, values['loc_strada-0']);
                }

                this.formApi.setValues({
                    [`loc_tip_artera-${index}`]: values['loc_tip_artera-0'],
                    [`loc_nr_strada-${index}`]: values['loc_nr_strada-0'],
                    [`loc_bloc-${index}`]: values['loc_bloc-0'],
                    [`loc_scara-${index}`]: values['loc_scara-0'],
                    [`loc_etaj-${index}`]: values['loc_etaj-0'],
                    [`loc_apartament-${index}`]: values['loc_apartament-0'],
                });
            }
        }
    }

    async setValidity(index) {
        return new Promise(async resolve => {
            const { props } = this;
            const isCombo = !_.isEmpty(props.session.ee_loc) && !_.isEmpty(props.session.gaz_loc);
            if (index === 1 && !isCombo) {
                return resolve();
            }

            await this.checkPod(index);
            const { values } = this.formApi.getState();
            if (!values[`tip_valabilitate-${index}`]) {
                this.formApi.setValue(`tip_valabilitate-${index}`, false);
                this.setState({ [`docValidity-${index}`]: null });
            }
            resolve();
        });
    }

    async setMonthValues(index) {
        await this.checkPod(index);
        const flow = this.getFlow(index);

        const perYear = this.formApi.getValue(`loc_cantitate_anuala-${index}`);
        const usage = this.getUsage(flow, null, perYear, true, index);

        this.formApi.setValues({
            [`ianuarie-${index}`]: strings.formatNumber(usage.ian),
            [`februarie-${index}`]: strings.formatNumber(usage.feb),
            [`martie-${index}`]: strings.formatNumber(usage.mar),
            [`aprilie-${index}`]: strings.formatNumber(usage.apr),
            [`mai-${index}`]: strings.formatNumber(usage.mai),
            [`iunie-${index}`]: strings.formatNumber(usage.iun),
            [`iulie-${index}`]: strings.formatNumber(usage.iul),
            [`august-${index}`]: strings.formatNumber(usage.aug),
            [`septembrie-${index}`]: strings.formatNumber(usage.sep),
            [`octombrie-${index}`]: strings.formatNumber(usage.oct),
            [`noiembrie-${index}`]: strings.formatNumber(usage.noi),
            [`decembrie-${index}`]: strings.formatNumber(usage.dec),
        });
    }

    isValid() {
        return this.state.isValid && noFormErrors(this);
    }

    isNLCValid(index) {
        const { code } = this.state.pods[index];
        const nlcValidation = this.props.nlcValidation[code];
        // const flow = this.getFlow(index);

        if (nlcValidation) {
            if (!nlcValidation.valid) {
                return false;
            }

            // if (flow.toLowerCase() === 'ee') {
            //     if (nlcValidation.isEnel && this.getNLCType(index) !== 'POD') {
            //         return false;
            //     }
            //     if (!nlcValidation.isEnel && this.getNLCType(index) !== 'NLC') {
            //         return false;
            //     }
            // }
        }

        return true;
    }

    isCountyValid(index) {
        const { session } = this.props;
        const { code } = this.state.pods[index];
        const nlcValidation = this.props.nlcValidation[code];

        if (nlcValidation && nlcValidation.county) {
            return session.judet === nlcValidation.county.denumire;
        }
        return true;
    }

    loadNLCCode(index) {
        return new Promise(async resolve => {
            const type = this.getNLCType(index);

            await this.checkPod(index);
            const { code } = this.state.pods[index];
            if (!code) {
                resolve();
            }

            const nlc = this.props.nlc[code];
            if (type === 'NLC') {
                const nlcCode = nlc ? nlc.cod_pod : '';

                if (nlcCode) {
                    await this.updatePod(index, 'showNLC', true);
                    await this.updatePod(index, 'disableNLC', true);
                    this.formApi.setValue(`loc_nlc-${index}`, nlcCode);
                    resolve();
                } else {
                    await this.updatePod(index, 'showNLC', true);
                    await this.updatePod(index, 'disableNLC', false);
                    resolve();
                }
            } else {
                await this.updatePod(index, 'showNLC', false);
                await this.updatePod(index, 'disableNLC', false);
                resolve();
            }
        });
    }

    async addFormErrorWrapper(text, index) {
        await addFormError(this, `pod-${index}`, text);
    }

    async validateNLC(index) {
        await this.checkPod(index);
        const { authUser } = this.props;
        const { code } = this.state.pods[index];
        const nlc = this.props.nlc[code];
        const flow = this.getFlow(index);
        const nlcValidation = this.props.nlcValidation[code];

        if (_.isNil(nlc)) {
            await addFormError(
                this,
                `pod-${index}`,
                `Cod ${this.getLabel(
                    index
                )} introdus nu a fost găsit. Verifică corectitudinea acestuia și încearcă din nou. Pentru mai multe detalii poți suna la 0800 07 07 01.`
            );
            return;
        }

        if (!this.isNLCValid(index)) {
            await addFormError(
                this,
                `pod-${index}`,
                `Cod ${this.getLabel(
                    index
                )} introdus este invalid. Verifică corectitudinea acestuia și încearcă din nou. Pentru mai multe detalii poți suna la 0800 07 07 01.`
            );
            return;
        }

        if (code.substring(0, 3) === 'OTO') {
            await addFormError(
                this,
                `pod-${index}`,
                'POD eronat. Contactati noul distribuitor Premier pentru POD-ul corect'
            );
            return;
        }

        if (code.substring(0, 3) === 'OTO') {
            await addFormError(
                this,
                `pod-${index}`,
                'POD eronat. Contactati noul distribuitor Premier pentru POD-ul corect'
            );
            return;
        }

        // check COMBO codes
        if (index > 0 && flow === this.getFlow(0)) {
            await addFormError(
                this,
                `pod-${index}`,
                `Codul ${this.getLabel(index)} a fost deja introdus.`
            );
            return;
        }

        if (!_.isNil(this.props.session.client)) {
            const county = _.find(this.props.counties, item => item.denumire === nlc.districtId);
            if (county && !county.distribution) {
                await addFormError(
                    this,
                    `pod-${index}`,
                    <span>
                        Distribuitorul nu a putut fi identificat pentru judetul {nlc.districtId}.
                    </span>
                );
                return;
            }

            const isEnelCounty =
                !_.isNil(county) &&
                county.distribution &&
                !_.isNil(county.distribution.distributie_enel) &&
                county.distribution.distributie_enel === 'D';
            if (nlc) {
                switch (nlc.status) {
                    case 'ACTIV':
                        if (
                            flow === 'gaz' &&
                            nlc.cnp_cui ===
                                (this.props.session.contract_type === 'b2b'
                                    ? this.props.session.company.data.cui
                                    : this.props.session.client.cnp) &&
                            nlc.noOfSupplies > 1
                        ) {
                            await addFormError(
                                this,
                                `pod-${index}`,
                                <span>
                                    Contractul de furnizare activ cu mai multe locuri de consum.
                                </span>
                            );
                            return;
                        } else if (isEnelCounty) {
                            if (
                                nlc.piata === 'PL' &&
                                nlc.cnp_cui ===
                                    (this.props.session.contract_type === 'b2b'
                                        ? this.props.session.company.data.cui
                                        : this.props.session.client.cnp) &&
                                nlc.noOfSupplies > 1
                            ) {
                                await addFormError(
                                    this,
                                    `pod-${index}`,
                                    <span>
                                        Contractul de furnizare activ cu mai multe locuri de consum.
                                    </span>
                                );
                                return;
                            }
                        }
                        // else {
                        //     await addFormError(this,
                        //         `pod-${index}`,
                        //         <span>
                        //             Contractul de furnizare pentru locul de consum selectat este activ la PPC.
                        //             <br />
                        //             Te rugăm să reiei procesul de contractare{' '}
                        //             <a
                        //                 href=" https://www.enel.ro/enel-muntenia/ro/clienti-rezidentiali/ofertele-tale.html"
                        //                 target="_blank"
                        //             >
                        //                 aici
                        //             </a>
                        //             .
                        //         </span>
                        //     );
                        //     return;
                        // }

                        // update current provider based on NLC info
                        if (nlc.supplyerId) {
                            this.props.setProvider(nlc.supplyerId);
                        }
                        break;
                    case 'IN REZILIERE':
                        await addFormError(
                            this,
                            `pod-${index}`,
                            'Contractul de furnizare pentru locul de consum selectat este în curs de reziliere. Pentru mai multe detalii sună la 0800 07 07 01.'
                        );
                        return;
                    case 'IN PRELUARE':
                        await addFormError(
                            this,
                            `pod-${index}`,
                            'Există o solicitare în curs pentru încheierea unui contract de furnizare pentru locul de consum selectat. Pentru mai multe detalii sună la 0800 07 07 01.'
                        );
                        return;
                    case 'IN DERULARE':
                        await addFormError(
                            this,
                            `pod-${index}`,
                            'Există o solicitare în curs pentru încheierea unui contract de furnizare pentru locul de consum selectat.'
                        );
                        return;
                    case 'INACTIV':
                        break;
                    case 'NOK':
                        if (nlcValidation && nlcValidation.isEnel === true) {
                            await addFormError(
                                this,
                                `pod-${index}`,
                                'Codul POD/locul de consum nu a fost găsit în baza de date. Vă rugăm să iniţiaţi procedura de contractare pe un alt canal de vânzare.'
                            );
                            return;
                        }
                        break;
                    default:
                        break;
                }
                if (
                    (nlc.status === 'ACTIV' && (nlc.supplyerId === EE || nlc.supplyerId === EEM)) ||
                    ((nlc.status === 'INACTIV' || nlc.status === 'NOK') &&
                        Object.keys(ENEL_AREAS).includes(nlc.districtId))
                ) {
                    const mapFurnizorIdToName = { [EE]: 'EE', [EEM]: 'EEM' };
                    const supplyerId =
                        (nlc.status === 'ACTIV' && nlc.supplyerId) ||
                        ((nlc.status === 'INACTIV' || nlc.status === 'NOK') &&
                            ENEL_AREAS[nlc.districtId]);
                    if (
                        !authUser.furnizorImputernicit ||
                        authUser.furnizorImputernicit.length === 0 ||
                        !authUser.furnizorImputernicit.includes(mapFurnizorIdToName[supplyerId])
                    ) {
                        await addFormError(
                            this,
                            `pod-${index}`,
                            `Locul de consum este din zona ${mapFurnizorIdToName[supplyerId]}. Nu aveti drept de semnatura pe aceasta companie`
                        );
                    }
                }
            }
        }
    }

    validateProvider(type) {
        const { values } = this.formApi.getState();
        const provider = _.find(
            this.props[`${type}Providers`],
            item => item.internal_id === values.furnizor_actual
        );
        const county = _.find(this.props.counties, item => item.denumire === values.loc_judet);

        let isEnelProvider = false;
        if (provider && provider.denumire) {
            isEnelProvider = provider.denumire.toLowerCase().match('ppc');
        }

        let isEnelCounty = false;
        if (county && county.distribution) {
            isEnelCounty =
                !_.isNil(county.distribution.distributie_enel) &&
                county.distribution.distributie_enel === 'D';
        }

        /*  if (values.are_furnizare_activa && isEnelProvider && !isEnelCounty) {
                 const { formErrors } = this.state;
                 formErrors.provider = ['Procesul nu poate fi continuat. Contract activ la ENEL.'];
                 this.setState({
                     formErrors,
                 });
             } */
    }

    async validateNLCRequired(index) {
        await this.checkPod(index);
        const { code } = this.state.pods[index];
        let error = '';
        if (!code) {
            error = 'POD/CLC este obligatoriu.';
        }

        if (error) {
            await addFormError(this, `pod-${index}`, error);
        }
    }

    async validate() {
        await checkForm(this);
        await resetFormErrors(this);
        // this.validateProvider('ee');
    }

    async checkPODValidations() {
        for (let index = 0; index < this.state.pods.length; index++) {
            if (
                this.state.pods[index].code &&
                !this.state.pods[index].expand &&
                !this.state.pods[index].deleted
            ) {
                await addFormError(
                    this,
                    `pod-${index}`,
                    `Cod ${this.getLabel(index)} introdus nu a fost validat.`
                );
            }
        }
    }

    async validateMeasurementIndexes(indexes) {
        return await ApiService.get('/sap-check-index', indexes, true);
    }

    handleActiveChange(e, index) {
        return new Promise(async resolve => {
            if (!e.target.value) {
                this.formApi.setValues({
                    [`furnizor_actual-${index}`]: '',
                });
            }

            await this.checkPod(index);
            await this.updatePod(index, 'active', !!e.target.value);
            await this.setStartDate(index);
            resolve();
        });
    }

    handleStatementChange(e, index) {
        this.setState({ isPlaceStatementChecked: e.target.checked });

        if (this.formApi && e.target.checked) {
            this.formApi.setValue(`tip_valabilitate-${index}`, false);
            this.setState({ validityLoaded: true }, () => {
                const startDate = this.formApi.getValue(`furnizor_data_start-${index}`);
                if (startDate) {
                    const docValidity = moment(startDate, 'DD.MM.YYYY')
                        .add(12, 'months')
                        .format('DD.MM.YYYY');
                    this.formApi.setValue(`valabilitate-${index}`, docValidity);
                    this.setState({ [`docValidity-${index}`]: docValidity });
                }
            });
        }
    }

    handleProviderChange(e, index) {
        this.setStartDate(index);
    }

    handleOwnerChange(e, index) {
        this.setStartDate(index);
    }

    handleDistributorChange(e, index) {
        this.setState({ [`distributorId-${index}`]: e.target.value });
    }

    async handleCountyChange(e, prefix, index) {
        await this.props.fetchCities(e.target.value);
        this.formApi.setValues({
            [`${prefix}localitate-${index}`]: '',
            [`${prefix}strada-${index}`]: '',
        });
        await this.loadNLCCode(index);
        await this.setConsumption(index);
    }

    async handleCityChange(e, prefix, index) {
        await this.props.fetchStreets(e.target.value);
        this.formApi.setValues({ [`${prefix}strada-${index}`]: '' });
    }

    handleExpandToggle(e, index) {
        this.updatePod(index, 'expand', !this.state.pods[index].expand);
    }

    handleQuantityChange(perYear, index) {
        let isAnualConsumptionValid = true;
        if (
            this.props.contractType === 'b2b' &&
            (perYear > 1000000 || (this.props.flow === 'gaz' && perYear > 280000))
        ) {
            isAnualConsumptionValid = false;
        }
        this.setState({ [`perYear-${index}`]: perYear, isAnualConsumptionValid });
        this.setMonthValues(index);

        // set gas pressure and pressure level
        if (this.getFlow(index) === 'gaz') {
            setTimeout(() => {
                const category = this.formApi.getValue(`loc_categorie-${index}`);
                const pressure = ['C1', 'C2'].includes(category) ? '0.03' : '0.05';
                this.formApi.setValue(`loc_pressure-${index}`, pressure);
                this.formApi.setValue(`loc_presureLevel-${index}`, 'scazuta');
            }, 250);
        }
    }

    handleValidityChange(e, index) {
        this.setState({ [`docValidity-${index}`]: e.target.value });
    }

    handlePODChange(e, index) {
        this.updatePod(index, 'code', e.target.value.replace('/', ''));
    }

    async handleAddClick() {
        await this.checkPod(this.state.pods.length);
    }

    handleDeleteClick(e, index) {
        this.setState({ currentIndex: index });
        this.deleteCodeModal.current.show();
    }

    handlePutereAvizataChange(e, index) {}

    async handleRejectConfirm(e) {
        const reason = 'Sesiune inchisa de Agent. Loc de consum Activ in piata libera.';
        const { rejectOffer } = this.props;
        const { id } = this.props.session;
        if (id) {
            await rejectOffer(id, 'EE', reason);
            await rejectOffer(id, 'GAZ');
        }
        browserHistory.push('/sessions');
    }

    async handleDocDelete(docType, flow) {
        const { deleteDoc, fetchDocs } = this.props;
        await deleteDoc(docType, flow);
        fetchDocs(flow, docType);
    }

    async handleDeleteConfirm() {
        const index = this.state.currentIndex;
        const flow = this.getFlow(index);
        await this.props.patchSession({
            [`${flow}_are_furnizare_activa`]: null,
            [`${flow}_furnizor_actual`]: null,
            [`${flow}_schimba_titular`]: null,
            [`${flow}_loc`]: null,
            [`${flow}_consum`]: null,
        });
        const pods = [...this.state.pods];
        pods[index] = {
            ...this.podTemplate,
            deleted: true,
        };
        this.setState({ pods });
    }

    async handleValidateClick(e, index) {
        await resetFormErrors(this);
        await this.validateNLCRequired(index);

        this.checkPod(index);
        const { code } = this.state.pods[index];

        if (noFormErrors(this)) {
            await this.props.validateNLC(code);
            await this.props.checkNLC(code);
            await this.validateNLC(index);

            // try {
            //     await this.props.checkOfferStatus(
            //         this.props.session.client.cnp,
            //         this.props.session.client.email,
            //         this.props.session.client.telefon_mobil,
            //         this.props.nlcValidation[code].type
            //     );
            // } catch (err) {
            //     await addFormError(this, `pod-${index}`, err.message);
            // }

            if (noFormErrors(this)) {
                const nlc = this.props.nlc[code];
                const nlcValidation = this.props.nlcValidation[code];

                if (nlcValidation && nlcValidation.county) {
                    await this.props.fetchCities(nlcValidation.county.denumire);
                    this.formApi.setValue(`loc_judet-${index}`, nlcValidation.county.denumire);
                }

                if (nlc) {
                    await this.updatePod(index, 'expand', true);
                    if (this.shouldRenderPlaceDocs(index)) {
                        this.setValidity(index);
                    }

                    if (nlc.districtId) {
                        await this.props.fetchCities(nlc.districtId);
                        this.formApi.setValue(`loc_judet-${index}`, nlc.districtId);
                        if (nlc.cityId) {
                            await this.props.fetchStreets(nlc.cityId);
                            this.formApi.setValue(`loc_localitate-${index}`, nlc.cityId);
                            this.setState({ cityLoaded: true }, () => {
                                this.formApi.setValue(`loc_strada-${index}`, nlc.streetId);
                            });
                        }
                    }

                    if (nlc.status === 'ACTIV') {
                        this.formApi.setValue(`are_furnizare_activa-${index}`, true);
                        await this.handleActiveChange({ target: { value: true } }, index);
                    }

                    if (nlc.status && nlc.status !== 'INACTIV' && nlc.supplyerId) {
                        this.formApi.setValue(`furnizor_actual-${index}`, nlc.supplyerId);
                    }

                    if (nlc.cnp_cui) {
                        this.formApi.setValue(
                            `schimba_titular-${index}`,
                            (this.props.session.contract_type === 'b2b'
                                ? this.props.session.company.data.cui
                                : this.props.session.client.cnp) !== nlc.cnp_cui
                        );
                    }

                    if (nlc.codeENELTEL) {
                        await this.props.queryIndexes(nlc.codeENELTEL);
                        if (this.props.measurementIndexes.INDEXES) {
                            this.props.measurementIndexes.INDEXES.forEach(indexItem => {
                                this.formApi.setValue(
                                    `index-actual-${indexItem.ID_CADRAN}-${index}`,
                                    indexItem.INDEX
                                );
                            });
                        }
                    }
                    await this.setStartDate(index);

                    this.formApi.setValues({
                        [`loc_tip_artera-${index}`]: nlc.streetTypeId,
                        [`loc_nr_strada-${index}`]:
                            nlc.status !== 'NOK' &&
                            (!nlc.streetNo ||
                                0 === nlc.streetNo.length ||
                                nlc.streetNo.toLowerCase() === 'fn')
                                ? 'FN1'
                                : nlc.streetNo,
                        [`loc_bloc-${index}`]: nlc.building,
                        [`loc_scara-${index}`]: nlc.entrance,
                        [`loc_etaj-${index}`]: nlc.floor,
                        [`loc_apartament-${index}`]: nlc.apartment,
                        [`loc_cod_postal-${index}`]: nlc.status !== 'NOK' ? '000000' : '',
                    });

                    await this.setValues(index, true);

                    if (index > 0) {
                        this.setDefaultAddress(index);
                    }

                    if (nlc.status === 'ACTIV' && nlc.piata === 'PL') {
                        this.consumptionPlaceActive.current.show();
                    }
                }
            } else {
                await this.updatePod(index, 'expand', false);
            }
        }
    }

    async handleNextClick(e) {
        if (this.props.contractType === 'b2b' && !this.state.isAnualConsumptionValid) {
            return this.anualConsumptionValidation.current.show();
        }

        await this.validate();
        await this.checkPODValidations();

        if (this.isValid()) {
            const { values } = this.formApi.getState();
            const { session } = this.props;
            for (let index = 0; index < this.state.pods.length; index++) {
                if (!this.state.pods[index].code || this.state.pods[index].deleted) {
                    continue;
                }

                const pod = this.state.pods[index];

                const nlcPod = this.props.nlc[pod.code];
                const podCnp = nlcPod.cnp_cui;

                const determineIfIndexIsRequired = ({
                    podStatus,
                    podCnp,
                    clientCnp,
                    userHasSupplier,
                    currentSupplier,
                    isChangeOfTitular,
                }) => {
                    if (podStatus === 'ACTIV' && podCnp === clientCnp) {
                        if (nlcPod.piata === 'PR') return true;
                        return false;
                    }
                    if (podStatus === 'ACTIV' && podCnp !== clientCnp) return true;
                    if (podStatus !== 'ACTIV') {
                        const enelSuppliersInternalIds = ['T_RO24387371', 'T_RO22000460'];
                        if (userHasSupplier && enelSuppliersInternalIds.includes(currentSupplier)) {
                            if (isChangeOfTitular === true) return true;
                            return false;
                        }
                        return true;
                    }
                };

                const isIndexRequired = determineIfIndexIsRequired({
                    podStatus: nlcPod.status,
                    podCnp,
                    clientCnp:
                        this.props.contractType === 'b2c'
                            ? this.props.session.client.cnp
                            : this.props.session.company.data.cui,
                    userHasSupplier: values['are_furnizare_activa-0'],
                    currentSupplier: values['furnizor_actual-0'],
                    isChangeOfTitular: values['schimba_titular-0'],
                });

                const flow = this.getFlow(index);
                const perYear = this.state[`perYear-${index}`];
                const place = getFromForm(this.formApi, 'loc_', `-${index}`);
                const inputMeasures = getFromForm(this.formApi, 'meas_index_', `-${index}`);
                if (session['measurement_indexes']) {
                    Object.keys(session['measurement_indexes']).forEach(key => {
                        if (
                            key !== 'METER_NUMBER' &&
                            (inputMeasures[key] === null ||
                                inputMeasures[key] === undefined ||
                                inputMeasures[key] === '')
                        ) {
                            inputMeasures[key] = null;
                        }
                    });
                }
                const placeDoc = {
                    tip: 'ACT_PROPRIETAR',
                    nr: null,
                    valabilitate: null,
                };

                const currentProvider = values[`furnizor_actual-${index}`] || '';
                place.furnizor_id = currentProvider;
                place.distribuitor_id = this.state[`distributorId-${index}`];
                place.categorie = place.categorie || null;
                place.denumire = 'LOCUINTA'; // TODO recheck
                place.necesar_pif = false; // TODO recheck
                place.nivel_tensiune = 'JT'; // TODO recheck
                place.nlcInfo = this.getNLCInfo(index);
                place.address = this.getPlaceAddress(index);

                place.index = place.index || '';
                if (!place.index) {
                    place.data_reziliere = '';
                }

                // const hasStatement = !!window.document.getElementById('declaratie-act-spatiu');
                // place.declaratie_act_spatiu = hasStatement
                //     ? place.declaratie_act_spatiu || false
                //     : null;

                if (flow === 'ee') {
                    place.consumator_gaze = place.consumator_gaze || false;
                }

                if (!this.state.pods[index].showNLC) {
                    place.nlc = place.cod_pod;
                }

                if (values[`tip_valabilitate-${index}`]) {
                    place.valabilitate = moment(
                        this.state[`docValidity-${index}`],
                        'DD.MM.YYYY'
                    ).format('YYYY-MM-DD');
                }

                if (place && place.ownership_valabilitate) {
                    place.ownership_valabilitate = moment(
                        place.ownership_valabilitate,
                        'DD.MM.YYYY'
                    ).format('YYYY-MM-DD');
                }

                if (place && place.ownership_valabilitate) {
                    place.ownership_valabilitate = moment(
                        place.ownership_valabilitate,
                        'DD.MM.YYYY'
                    ).format('YYYY-MM-DD');
                }

                if (place.data_reziliere) {
                    place.data_reziliere = moment(place.data_reziliere, 'DD.MM.YYYY').format(
                        'YYYY-MM-DD'
                    );
                }

                const invalidInputFields = [];
                const { code } = this.state.pods[index];
                const nlc = this.props.nlc[code];

                if (nlc && !this.state.continueWithoutValidation) {
                    const handleIdexSubmit = async value => {
                        const formValue = this.formApi.getValue(value.indexName);
                        if (formValue !== undefined) {
                            const indexItem = {
                                CADRAN: value.CADRAN,
                                INDEX: formValue,
                                POD: this.state.pods[index].code,
                                SERIE_CONTOR: this.props.measurementIndexes.SERIE_CONTOR,
                            };

                            if (podCnp === this.props.session.client.cnp) {
                                const response = await this.validateMeasurementIndexes(indexItem);
                                if (response === 'NOK')
                                    invalidInputFields.push(`${value.indexName.toLowerCase()}`);
                            }
                        }
                    };
                    if (flow === 'ee') {
                        const meas_index_ele_singlerate = this.formApi.getValue(
                            `meas_index_ELE_SINGLERATE-${index}`
                        );

                        if (nlcPod.status === 'NOK') {
                            if (isIndexRequired && meas_index_ele_singlerate === undefined) {
                                invalidInputFields.push(`meas_index_ele_singlerate-${index}`);
                            }
                        } else {
                            if (meas_index_ele_singlerate !== undefined) {
                                const indexItem = {
                                    CADRAN: '1.8.0',
                                    INDEX: meas_index_ele_singlerate,
                                    POD: this.state.pods[index].code,
                                    SERIE_CONTOR: this.props.measurementIndexes.SERIE_CONTOR,
                                };

                                if (podCnp === this.props.session.client.cnp) {
                                    const response = await this.validateMeasurementIndexes(
                                        indexItem
                                    );
                                    if (response[1] === 'NOK')
                                        invalidInputFields.push(
                                            `meas_index_ele_singlerate-${index}`
                                        );
                                }
                            } else {
                                if (isIndexRequired) {
                                    invalidInputFields.push(`meas_index_ele_singlerate-${index}`);
                                }
                            }
                        }

                        [
                            {
                                indexName: `meas_index_ELE_DAY-${index}`,
                                CADRAN: '1.8.1',
                            },
                            {
                                indexName: `meas_index_ELE_NIGHT-${index}`,
                                CADRAN: '1.8.2',
                            },
                            {
                                indexName: `meas_index_ELE_GOL-${index}`,
                                CADRAN: '1.8.3',
                            },
                            { indexName: `meas_index_ELE_INDUCTIVE-${index}`, CADRAN: '5.8.0' },
                            {
                                indexName: `meas_index_ELE_CAPACITIVE-${index}`,
                                CADRAN: '8.8.0',
                            },
                        ].forEach(handleIdexSubmit);
                    } else if (flow === 'gaz') {
                        const meas_index_gaz_volum = this.formApi.getValue(
                            `meas_index_GAS-${index}`
                        );

                        if (nlcPod.status === 'NOK') {
                            if (isIndexRequired && meas_index_gaz_volum === undefined) {
                                invalidInputFields.push(`meas_index_gas-${index}`);
                            }
                        } else {
                            if (meas_index_gaz_volum !== undefined) {
                                const indexItem = {
                                    CADRAN: 'VOL',
                                    INDEX: meas_index_gaz_volum,
                                    POD: this.state.pods[index].code,
                                    SERIE_CONTOR: this.props.measurementIndexes.SERIE_CONTOR,
                                };

                                if (podCnp === this.props.session.client.cnp) {
                                    const response = await this.validateMeasurementIndexes(
                                        indexItem
                                    );
                                    if (response === 'NOK')
                                        invalidInputFields.push(`meas_index_gas-${index}`);
                                }
                            } else {
                                if (isIndexRequired) {
                                    invalidInputFields.push(`meas_index_gas-${index}`);
                                }
                            }
                        }
                    }
                }

                if (this.props.measurementIndexes.SERIE_CONTOR)
                    inputMeasures['METER_NUMBER'] = this.props.measurementIndexes.SERIE_CONTOR;
                if (!invalidInputFields.length) {
                    await this.props.patchSession({
                        judet: place.judet,
                        [`${flow}_are_furnizare_activa`]: values[`are_furnizare_activa-${index}`],
                        [`${flow}_furnizor_actual`]: currentProvider,
                        [`${flow}_putere_avizata`]: values[`putere_avizata-${index}`],
                        [`${flow}_furnizor_viitor`]: values[`furnizor_viitor-${index}`],
                        [`${flow}_schimba_furnizor`]: this.getProviderChange(index),
                        [`${flow}_schimba_titular`]: values[`schimba_titular-${index}`],
                        measurement_indexes: inputMeasures,
                        [`${flow}_loc`]: place,
                        [`${flow}_loc_doc`]: placeDoc,
                        [`${flow}_furnizor_data_start`]: moment(
                            values[`furnizor_data_start-${index}`],
                            'DD.MM.YYYY'
                        ).format('YYYY-MM-DD'),
                    });

                    if (this.props.isLinkSent) {
                        const offer = session[`${flow}_serviciu`];
                        await this.props.patchSession({
                            [`${flow}_consum`]: this.getUsage(flow, offer, perYear, false, index),
                        });
                    }
                    if (e) this.props.onNextClick();
                } else {
                    this.setState({ invalidInputFields: invalidInputFields });
                    this.indexesErrorModal.current.show();
                }
            }
            // if (e) this.props.onNextClick();
        } else {
            if (e) pageService.scrollToError();
        }
    }

    renderAddButton() {
        const { isLinkSent } = this.props;
        if (!isLinkSent && this.getPods().length === 1) {
            return (
                <Button
                    secondary
                    outline
                    className="add-btn"
                    value="Adauga POD"
                    onClick={this.handleAddClick}
                />
            );
        }
    }

    renderDeleteButton(index) {
        const { isLinkSent } = this.props;
        if (!isLinkSent && this.getPods().length > 1) {
            return (
                <div className="offset-md-6 col-md-1">
                    <Button
                        secondary
                        outline
                        fullWidth
                        hasIcon
                        value={<i className="ion-md-close" />}
                        onClick={e => this.handleDeleteClick(e, index)}
                    />
                </div>
            );
        }
    }

    renderPOD(index) {
        const { isLinkSent, nlc } = this.props;
        const { pods } = this.state;
        return (
            <Fragment key={index}>
                <FormErrors errors={this.state.formErrors[`pod-${index}`]} />
                <div className="row pod-wrapper">
                    <Text
                        className="col-md-3"
                        label={this.getLabel(index)}
                        name={`loc_cod_pod-${index}`}
                        validate={requiredBefore(isLinkSent)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        onChange={e => this.handlePODChange(e, index)}
                        upperCase
                    />
                    <div className="col-md-2">
                        <Button
                            secondary
                            fullWidth
                            value="Valideaza"
                            disabled={isLinkSent}
                            onClick={e => this.handleValidateClick(e, index)}
                        />
                    </div>
                    {/* <div className="col-md-1">
                            <Button
                                secondary
                                outline
                                fullWidth
                                hasIcon
                                value={
                                    <i
                                        className={
                                            this.state.pods[index].expand
                                                ? 'ion-ios-arrow-up'
                                                : 'ion-ios-arrow-down'
                                        }
                                    />
                                }
                                onClick={e => this.handleExpandToggle(e, index)}
                            />
                        </div> */}
                    {this.renderDeleteButton(index)}
                </div>
                {nlc && (
                    <PodBody
                        isExpanded={pods[index].expand}
                        isPlaceStatementChecked={this.state.isPlaceStatementChecked}
                        isActive={pods[index].active}
                        formApi={this.formApi}
                        flow={this.getFlow(index)}
                        contractType={this.props.contractType}
                        index={index}
                        shouldRenderPlaceDocs={this.shouldRenderPlaceDocs(index)}
                        shouldRenderContractNumber={this.shouldRenderContractNumber(index)}
                        nlc={this.getNLCInfo(index)}
                        showNLC={pods[index].showNLC}
                        disableNLC={pods[index].disableNLC}
                        docOptions={this.state.docs}
                        addFormErrorWrapper={this.addFormErrorWrapper}
                        placeInfoSectionReference={this}
                        onCountyChange={this.handleCountyChange}
                        onCityChange={this.handleCityChange}
                        onActiveChange={e => this.handleActiveChange(e, index)}
                        onProviderChange={e => this.handleProviderChange(e, index)}
                        onStatementChange={e => this.handleStatementChange(e, index)}
                        onOwnerChange={e => this.handleOwnerChange(e, index)}
                        onDistributorChange={e => this.handleDistributorChange(e, index)}
                        onQuantityChange={perYear => this.handleQuantityChange(perYear, index)}
                        onValidityChange={e => this.handleValidityChange(e, index)}
                        onPutereAvizataChange={e => this.handlePutereAvizataChange(e, index)}
                        onDocDelete={this.handleDocDelete}
                        getProviderChange={this.getProviderChange}
                    />
                )}
            </Fragment>
        );
    }

    render() {
        const { step, isCurrent, show, isContractSent } = this.props;
        return (
            <Section
                title="Locuri de Consum"
                step={step}
                isCurrent={isCurrent}
                show={show}
                className="PlaceInfoSection"
            >
                <ConfirmModal
                    title={`Esti sigur ca vrei sa stergi acest ${this.getLabel(
                        this.state.currentIndex
                    )}?`}
                    ref={this.deleteCodeModal}
                    confirmLabel="Sterge"
                    dismissLabel="Anuleaza"
                    onConfirm={this.handleDeleteConfirm}
                />
                <ConfirmModal
                    title={'Nu se poate contracta accest segment de vanzare pe acest canal'}
                    ref={this.anualConsumptionValidation}
                    confirmLabel="inchide"
                    onConfirm={() => {}}
                />
                <ConfirmModal
                    title="Loc de consum Activ"
                    description="Locul de consum este activ in Piata Libera la PPC. Daca doriti sa continuati procesul de contractare apasati DA, daca doriti sa renuntati la proces apasati NU."
                    ref={this.consumptionPlaceActive}
                    confirmLabel="DA"
                    dismissLabel="NU"
                    onDismiss={this.handleRejectConfirm}
                    showCloseIcon
                />
                <Form autoComplete="off" getApi={this.setFormApi}>
                    {_.map(this.state.pods, (pod, index) =>
                        pod.deleted ? null : this.renderPOD(index)
                    )}
                </Form>
                {!isContractSent && (
                    <div className="spaced-top">
                        <Button outlined value="Continua" onClick={this.handleNextClick} />
                        {this.renderAddButton()}
                    </div>
                )}
                <InvalidIndexesPopup
                    reference={this.indexesErrorModal}
                    errors={this.state.invalidInputFields}
                    continue={() => {
                        if (this.state.invalidInputFields.length) return;
                        this.setState({ continueWithoutValidation: true }, () =>
                            this.handleNextClick({})
                        );
                    }}
                />
            </Section>
        );
    }
}

const mapStateToProps = state => ({
    counties: countiesSelectors.getItems(state),
    measurementIndexes: state.measurementIndexes,
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    client: getClient(state),
    streets: getStreets(state),
    distributors: getDistributors(state),
    session: getSession(state),
    flow: getFlow(state).toLowerCase(),
    contractType: getContractType(state),
    nlc: getNLC(state),
    nlcValidation: getNLCValidation(state),
    startDate: getStartDate(state),
    eeProviders: providersSelectors.getItems(state, 'ee'),
    gazProviders: providersSelectors.getItems(state, 'gaz'),
    isLinkSent: isLinkSent(state),
    isContractSent: isContractSent(state),
    docs: getDocs(state),
    isPlanSelected: isPlanSelected(state),
    plan: getCurrentPlan(state),
    authUser: getAuthUser(state),
});

const mapDispatchToProps = {
    fetchProviders: providersActions.fetchItems,
    fetchDistributors,
    queryIndexes,
    createSession,
    patchSession,
    fetchSession,
    fetchCounties,
    fetchCities,
    fetchStreetTypes,
    fetchStreets,
    fetchDocs,
    checkNLC,
    clearNLC,
    validateNLC,
    checkStartDate,
    setProvider,
    deleteDoc,
    rejectOffer,
    checkOfferStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceInfoSection);

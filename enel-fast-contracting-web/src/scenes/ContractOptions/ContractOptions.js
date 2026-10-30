import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import api from '../../services/api';

import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@material-ui/core';

import strings from 'services/strings';
import offerService from 'services/offer';
import * as ocrSelectors from 'store/ocr/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import * as providersSelectors from 'store/providers/selectors';
import { getSession } from 'store/session/selectors';
import { getItems as getDistributors } from 'store/distributors/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getBanks } from 'store/banks/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getFlow, getNLC, getStartDate } from 'store/client/selectors';
import { markAction, prevalidateEmailCfe, getProviderStartDate } from 'store/client/actions';

import * as ocrActions from 'store/ocr/actions';
import { patch as patchSession } from 'store/session/actions';
import { fetchAllItems as fetchDistributors } from 'store/distributors/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { fetchAllItems as fetchBanks } from 'store/banks/actions';

import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Select from 'components/validation/select';
import Button from 'components/validation/button';
import FormErrors from 'components/FormErrors';
import HeaderHero from 'components/heroes/HeaderHero';
import {
    required,
    codPostal,
    tel,
    localFormattedNumber,
    email,
    iban,
    integer,
    maxLength,
    putereAvizata,
    maxValue,
    containsDigit,
    localFormattedNumberWithoutDecimal,
} from 'components/validation/rules';
import pageService from 'services/page';

import './ContractOptions.scss';

// Gas consumption thresholds and categories enum
const GasConsumptionThresholds = {
    // C1 subcategory thresholds
    C1_1_MIN: 0,
    C1_1_MAX: 5560,
    C1_2_MIN: 5560,
    C1_2_MAX: 55560,
    C1_3_MIN: 55560,
    C1_3_MAX: 300000,

    // Main category thresholds
    C2_MIN: 280000,
    C2_MAX: 2800000,
    C3_MIN: 2800000,
    C3_MAX: 28000000,
    C4_MIN: 28000000,
    C4_MAX: 280000000,
    C5_MIN: 280000000
};

const GasConsumptionCategories = {
    C1_1: 'C1.1',
    C1_2: 'C1.2',
    C1_3: 'C1.3',
    C2: 'C2',
    C3: 'C3',
    C4: 'C4',
    C5: 'C5'
};

const propTypes = {
    counties: PropTypes.array,
    cities: PropTypes.array,
    streets: PropTypes.array,
    banks: PropTypes.array,
    streetTypes: PropTypes.object,
    session: PropTypes.object,
    flow: PropTypes.string,
    nlc: PropTypes.object,
    eeProviders: PropTypes.array,
    gazProviders: PropTypes.array,
    patchSession: PropTypes.func.isRequired,
    fetchDistributors: PropTypes.func.isRequired,
    fetchCities: PropTypes.func.isRequired,
    fetchStreets: PropTypes.func.isRequired,
    fetchBanks: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    counties: [],
    cities: [],
    streets: [],
    banks: [],
    streetTypes: {},
    flow: '',
    nlc: {},
    eeProviders: [],
    gazProviders: [],
    session: {
        client: {},
    },
};

class ContractOptions extends Component {
    form = {
        _furnizor_viitor: this.props.session[`${this.props.flow}_furnizor_viitor`] || '',
        _furnizor_data_start: this.props.session[`${this.props.flow}_furnizor_data_start`] || '',
        _factura: {
            judet: this.getFromSession('judet', 'factura'),
            localitate: this.getFromSession('localitate', 'factura'),
            tip_artera: this.getFromSession('tip_artera', 'factura') || 'STRADA',
            strada: this.getFromSession('strada', 'factura'),
            nr_strada: this.getFromSession('nr_strada', 'factura'),
            bloc: this.getFromSession('bloc', 'factura'),
            scara: this.getFromSession('scara', 'factura'),
            apartament: this.getFromSession('apartament', 'factura'),
            etaj: this.getFromSession('etaj', 'factura'),
            cod_postal: this.getFromSession('cod_postal', 'factura'),
            email: this.props.session[`${this.props.session.flow}_factura`] ? (this.props.session[`${this.props.session.flow}_factura`]['email']) : (this.props.session.contract_type === 'b2c' ? this.props.session.client.email : this.props.session.company.data.email),
            telefon_mobil: this.getFromSession('telefon_mobil', 'factura'),
            ritm: 'L',
            cu_avans: this.props.flow == 'ee',
            avans: this.getFromSession('avans', 'factura') || 'FACTURA',
            mod_corespondenta: this.getFromSession('mod_corespondenta', 'factura') || 'MAIL',
            iban: this.getFromSession('iban', 'factura'),
            banca: this.getFromSession('banca', 'factura'),
        },
        _loc: {
            categorie: this.getFromSession('categorie', 'factura') || GasConsumptionCategories.C1_1,
            eneltel: this.getFromSession('eneltel', 'loc'),
            consum_conventie: /* this.getFromSession('consum_conventie', 'loc') || */ true,
        },
        _cantitate_anuala: this.props.session[`${this.props.flow}_cantitate_anuala`] || 0,
        _consum: this.props.session[`${this.props.flow}_consum`] || null,
        ee_putere_avizata: this.props.flow == 'ee' ? this.props.session['ee_putere_avizata'] : null,
        measurement_indexes: this.props.session['measurement_indexes'] || {},
    };

    formErrors = {
        validity: [],
    };

    state = {
        form: this.form,
        consumeError: null,
        formErrors: this.formErrors,
        formKey: `form-${this.form._factura.avans}`,
        showInvoiceOverlay: false,
        showIndexWarningMessage: false,
        address: 'new',
        showMonthly: true,
        showHiddenMeters: false,
        showIndexValidationErrorOverlay: false,
        indexesWithErrors: [],
        continueWithoutChangingIndexes: false,
        measurementIndexes: null,
        consumTable: {},
        acceptAgreement: false,
        showWarningConsum: false,
        showWarningConsumGas: false,
    };

    constructor(props) {
        super(props);
        this.annual_consuption = React.createRef();
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchDistributors();
        this.props.fetchBanks();
        if (this.props.nlc && this.props.nlc.status && this.props.nlc.status.toUpperCase() !== 'NOK' && this.props.nlc.status.toUpperCase() !== 'INACTIV') {
            this.getMeasurementIndexes();
        }
        setTimeout(this.setValues, 200);

        this.props.markAction(pageService.actions.OPTIUNI_CONTRACTE_FURNIZARE.value);
    }

    getFromSession(property, scope) {
        try {
            if (this.props.session[`${this.props.flow}_${scope}`]) {
                return this.props.session[`${this.props.flow}_${scope}`][property] || '';
            }

            return '';
        } catch (error) {
            return null;
        }
    }

    getMeasurementIndexes() {
        api.get(`/sap-query-index?ENELID=${this.props.nlc.codeENELTEL}`)
            .then((result) => {
                this.setState((state) => ({
                    ...state,
                    measurementIndexes: result,
                    form: {
                        ...state.form,
                        measurement_indexes: {
                            METER_NUMBER: result.SERIE_CONTOR,
                            ELE_SINGLERATE: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.0') ? state.form.measurement_indexes.ELE_SINGLERATE : null,
                            ELE_DAY: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.1') ? state.form.measurement_indexes.ELE_DAY : null,
                            ELE_NIGHT: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.2') ? state.form.measurement_indexes.ELE_NIGHT : null,
                            ELE_GOAL: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.3') ? state.form.measurement_indexes.ELE_GOAL : null,
                            ELE_INDUCTIVE: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '5.8.0') ? state.form.measurement_indexes.ELE_INDUCTIVE : null,
                            ELE_CAPACITIVE: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '8.8.0') ? state.form.measurement_indexes.ELE_CAPACITIVE : null,
                            GAS: result.INDEXES.find((indexItem) => indexItem.ID_CADRAN === 'VOL') ? state.form.measurement_indexes.GAS : null,
                        },
                    },
                }));
            })
            .catch(console.error);
    }

    getFilteredCities() {
        if (this.state.form._factura.judet) {
            return _.filter(this.props.cities, (city) => city.judet == this.state.form._factura.judet);
        }
    }

    getFilteredStreets() {
        if (this.state.form._factura.localitate) {
            const city = _.find(this.props.cities, (city) => city.internal_id == this.state.form._factura.localitate);

            if (city) {
                return _.filter(this.props.streets, (street) => street.localitate == city.denumire);
            }
        }
    }

    hasCFE() {
        if (this.props.session[`${this.props.flow}_serviciu`]) {
            return this.props.session[`${this.props.flow}_serviciu`].cfe;
        }
    }

    async setValues() {
        // if (this.props.flow == 'gaz' || !_.isNil(this.props.session[`${this.props.flow}_loc`])) {
        const county = _.find(this.props.counties, (item) => item.denumire === this.props.session[`${this.props.flow}_loc`].judet);
        const perYear = this.props.session[`${this.props.flow}_cantitate_anuala`] || offerService.getInitialAnualQuantity(this.props.flow, county);
        let consum;

        // set pressure and pressure level
        if (this.props.flow === 'gaz') {
            const category = this.state.form._loc.categorie;
            const pressure = [GasConsumptionCategories.C1_1, GasConsumptionCategories.C1_2, GasConsumptionCategories.C1_3, GasConsumptionCategories.C2].includes(category) ? '0.03' : '0.05';
            this.setState({
                form: {
                    ...this.state.form,
                    _loc: {
                        ...this.state.form._loc,
                        pressure,
                        presureLevel: 'scazuta',
                    },
                },
            });
        }

        if (this.props.flow === 'gaz' && this.props.session[`${this.props.flow}_consum`]) {
            consum = this.props.session[`${this.props.flow}_consum`];
        } else if (this.props.session[`${this.props.flow}_consum`] && this.props.session[`${this.props.flow}_consum`][0]) {
            consum = this.props.session[`${this.props.flow}_consum`][0];
        }
        if (consum) {
            this.setState({
                form: {
                    ...this.state.form,
                    _cantitate_anuala: perYear,
                },
                consumTable: {
                    ian: strings.formatNumber(consum.ian),
                    feb: strings.formatNumber(consum.feb),
                    mar: strings.formatNumber(consum.mar),
                    apr: strings.formatNumber(consum.apr),
                    mai: strings.formatNumber(consum.mai),
                    iun: strings.formatNumber(consum.iun),
                    iul: strings.formatNumber(consum.iul),
                    aug: strings.formatNumber(consum.aug),
                    sep: strings.formatNumber(consum.sep),
                    oct: strings.formatNumber(consum.oct),
                    noi: strings.formatNumber(consum.noi),
                    dec: strings.formatNumber(consum.dec),
                },
            });
        } else if (this.props.session.contract_type !== 'b2b') {
            const e = {
                target: {
                    name: '_cantitate_anuala',
                    value: perYear,
                },
            };

            await this.handleQuantityChange(e);
        }
        if (!_.isNil(this.props.session.contract_type === 'b2c' ? this.props.session.client : this.props.session.company)) {
            const county = _.find(this.props.counties, (item) => item.denumire === this.props.session.judet);
            const isEnelCounty = !_.isNil(county) && county.distribution.distributie_enel == 'D';

            const currentProvider = _.find(this.props[`${this.props.flow}Providers`], (item) => item.internal_id == this.props.session[`${this.props.flow}_furnizor_actual`]);

            const isWinback = this.props.nlc && this.props.nlc.status && this.props.nlc.status === 'INACTIV';

            const isPR = this.props.nlc && this.props.nlc.piata && this.props.nlc.piata === 'PR';

            const options = {
                flow: this.props.flow,
                isEnelCounty,
                changeProvider: this.props.session[`${this.props.flow}_schimba_furnizor`],
                changeOwner: this.props.session[`${this.props.flow}_schimba_titular`],
                cui: currentProvider ? currentProvider.cui : null,
                isWinback,
                isPR,
            };

            try {
                await this.props.getProviderStartDate(options);
            } catch (err) {
                const { formErrors } = this.state;
                formErrors.validity.push(err.message);
                this.setState({ formErrors });
            }

            const startDate = moment(this.props.startDate, 'YYYY-MM-DD').format('YYYY-MM-DD');

            options.currentProvider = currentProvider;
            options.county = county;
            options.nlc = this.props.nlc.status;

            const nextProvider = offerService.getNextProvider(options);
            const rythm = offerService.getRythm(options);

            this.setState({
                form: _.extend(this.state.form, {
                    _furnizor_data_start: startDate,
                    _furnizor_viitor: nextProvider,
                    _factura: _.extend(this.state.form._factura, {
                        ritm: rythm,
                    }),
                }),
            });

            this.handleAddressChange({
                target: { value: `${this.props.flow}_loc` },
            });
        }
        // }

        if (this.hasCFE() && this.state.form._factura.mod_corespondenta === 'POSTA') {
            this.handleDigitalInvoiceChange({ target: { value: 'MAIL' } });
        }
    }

    isPLMarketContract() {
        const changeOwner = this.props.session[`${this.props.flow}_schimba_titular`];
        const changeProvider = this.props.session[`${this.props.flow}_schimba_furnizor`];
        const nlc = Object.keys(this.props.nlc).length > 0 ? this.props.nlc : this.props.session[`${this.props.flow}_loc`] && this.props.session[`${this.props.flow}_loc`].nlcInfo;
        const isActiveSupply = nlc && nlc.status && nlc.status === 'ACTIV';
        const isPL = nlc && nlc.piata && nlc.piata === 'PL';

        return !changeOwner && !changeProvider && isActiveSupply && isPL;
    }

    handleInputChange(e) {
        const data = {};
        data[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, {
                _factura: _.extend(this.state.form._factura, data),
            }),
        });
    }

    handleMeasurementChange(e) {
        const data = {};
        data[e.target.name] = e.target.value;

        this.setState((state) => ({
            ...state,
            form: {
                ...state.form,
                measurement_indexes: {
                    ...state.form.measurement_indexes,
                    ...data,
                },
            },
        }));

        if (this.isProductChangeOrTransferFlow() && ["GAS", "ELE_SINGLERATE"].includes(e.target.name)) {
            const key = e.target.name === "GAS" ? "VOL" : "1.8.0"
            let oldIndexValue = this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === key).INDEX;
            oldIndexValue = Number(oldIndexValue)
            const annualValue = this.state.form._cantitate_anuala;
            const currentValue = Number(e.target.value);
            if ((currentValue - oldIndexValue) > annualValue) {
                this.setState({ showIndexWarningMessage: true })
            }
        }
    }

    handlePrepayChange(e) {
        this.handleInputChange(e);
        this.setState({
            formKey: `form-${e.target.value}`,
        });

        if (e.target.value != 'BANCA') {
            this.setState({
                form: _.extend(this.state.form, {
                    _factura: _.extend(this.state.form._factura, {
                        iban: '',
                        banca: '',
                    }),
                }),
            });
        }
    }

    handleAddressChange(e) {
        this.setState(
            {
                address: e.target.value,
            },
            async () => {
                const addressData = offerService.getAddressBySelect(this.props.session, this.state.address);

                if (this.state.address != 'new') {
                    await this.props.fetchCities(addressData.judet);
                    await this.props.fetchStreets(addressData.tip_artera, addressData.localitate);
                }

                this.setState({
                    form: _.extend(this.state.form, {
                        _factura: _.extend(this.state.form._factura, addressData),
                    }),
                });
            }
        );
    }

    calculateUsage(coefficient, measuredSize) {
        const perYear = this.state.form._cantitate_anuala;
        const { flow } = this.props;

        return {
            anual: parseInt(perYear),
            lunar: flow === 'gaz' ? Math.round((perYear / 12) * 100) / 100 : Math.round(perYear / 12),
            ian: Math.round(parseFloat(this.state.consumTable.ian.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            feb: Math.round(parseFloat(this.state.consumTable.feb.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            mar: Math.round(parseFloat(this.state.consumTable.mar.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            apr: Math.round(parseFloat(this.state.consumTable.apr.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            mai: Math.round(parseFloat(this.state.consumTable.mai.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            iun: Math.round(parseFloat(this.state.consumTable.iun.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            iul: Math.round(parseFloat(this.state.consumTable.iul.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            aug: Math.round(parseFloat(this.state.consumTable.aug.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            sep: Math.round(parseFloat(this.state.consumTable.sep.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            oct: Math.round(parseFloat(this.state.consumTable.oct.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            noi: Math.round(parseFloat(this.state.consumTable.noi.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            dec: Math.round(parseFloat(this.state.consumTable.dec.toString().replace('.', '').replace(',', '.')) * coefficient * 100) / 100,
            marime_masurata: measuredSize,
        };
    }

    getUsage(flow, offer, quantity = '', calculateOnly) {
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
            }

            const judet = this.props.session.ee_loc.judet;

            const monthly = Math.floor(parseInt(quantity) / 12);
            const banatJudets = ['arad', 'caras-severin', 'hunedoara', 'timis', 'arad', 'caras-severin', 'hunedoara', 'timis'];

            const dobrogeaJudets = ['calarasi', 'constanta', 'ialomita', 'tulcea', 'calarasi', 'constanta', 'ialomita', 'tulcea'];

            const munteniaJudets = ['bucuresti', 'giurgiu', 'ilfov', 'bucuresti', 'giurgiu', 'ilfov'];

            const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];

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
                    months.reverse().forEach((el) => {
                        const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                        const dif = quantity - sumValues(obj);
                        const res = obj[el] + dif;
                        if (res < 0) obj[el] = 0;
                        else obj[el] = res;
                    });
                    return obj;
                }
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

                months.reverse().forEach((el) => {
                    const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                    const dif = quantity - sumValues(obj);
                    const res = obj[el] + dif;
                    if (res < 0) obj[el] = 0;
                    else obj[el] = res;
                });
                return obj;
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

                    months.reverse().forEach((el) => {
                        const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                        const dif = quantity - sumValues(obj);
                        const res = obj[el] + dif;
                        if (res < 0) obj[el] = 0;
                        else obj[el] = res;
                    });
                    return obj;
                }
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
                months.reverse().forEach((el) => {
                    const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                    const dif = quantity - sumValues(obj);
                    const res = obj[el] + dif;
                    if (res < 0) obj[el] = 0;
                    else obj[el] = res;
                });

                return obj;
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
                    months.reverse().forEach((el) => {
                        const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                        const dif = quantity - sumValues(obj);
                        const res = obj[el] + dif;
                        if (res < 0) obj[el] = 0;
                        else obj[el] = res;
                    });
                    return obj;
                }
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
                months.reverse().forEach((el) => {
                    const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                    const dif = quantity - sumValues(obj);
                    const res = obj[el] + dif;
                    if (res < 0) obj[el] = 0;
                    else obj[el] = res;
                });
                return obj;
            }
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
                months.reverse().forEach((el) => {
                    const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                    const dif = quantity - sumValues(obj);
                    const res = obj[el] + dif;
                    if (res < 0) obj[el] = 0;
                    else obj[el] = res;
                });
                return obj;
            }
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

            months.reverse().forEach((el) => {
                const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b);
                const dif = quantity - sumValues(obj);
                const res = obj[el] + dif;
                if (res < 0) obj[el] = 0;
                else obj[el] = res;
            });
            return obj;

            // return {
            //     ian: strings.formatNumber(monthly),
            //     feb: strings.formatNumber(monthly),
            //     mar: strings.formatNumber(monthly),
            //     apr: strings.formatNumber(monthly),
            //     mai: strings.formatNumber(monthly),
            //     iun: strings.formatNumber(monthly),
            //     iul: strings.formatNumber(monthly),
            //     aug: strings.formatNumber(monthly),
            //     sep: strings.formatNumber(monthly),
            //     oct: strings.formatNumber(monthly),
            //     noi: strings.formatNumber(monthly),
            //     dec: strings.formatNumber(parseInt(quantity) - 11 * monthly),
            // };
        }

        if (flow === 'gaz') {
            return this.calculateUsage(1, 'GAZ');
        }

        // if (offer.pret_ea_n) {
        // we add this by default for electricity
        usage.push(this.calculateUsage(1, 'EA'));
        // }
        if (offer.pret_eaz_n) {
            usage.push(this.calculateUsage(0.4, 'EAZ'));
        }
        if (offer.pret_eano_n) {
            usage.push(this.calculateUsage(0.6, 'EANO'));
        }
        if (offer.pret_eanw_n) {
            usage.push(this.calculateUsage(0.6, 'EANW'));
        }

        return usage;
    }

    monthNames = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];

    handleMonthChange = (value, month) => {
        let numericValue;
        if (value) {
            numericValue = parseFloat(value.replace('.', '').replace(',', '.'));
        } else {
            numericValue = 0;
        }
        // let total = numericValue;
        // this.monthNames.forEach((monthName) => {
        //     if (month !== monthName) {
        //         total += parseFloat(this.state.consumTable[monthName].replace('.', '').replace(',', '.'));
        //     }
        // });

        this.setState(
            {
                // form: _.extend(this.state.form,
                //     {
                //         _cantitate_anuala: Math.round(total),
                //     }),
                consumTable: { ...this.state.consumTable, [month]: value },
            },
            () => {
                // this.setState({
                //     form: _.extend(this.state.form, {
                //         _consum: this.getUsage(this.props.flow, this.props.session[`${this.props.flow}_serviciu`], total),
                //     }),
                // });
            }
        );
        if (this.props.flow !== 'gaz') {
            const perYear = parseFloat(this.state.form._cantitate_anuala || 0);
            let total = 0;

            this.monthNames.forEach((monthName) => {
                total += parseFloat(this.state.consumTable[monthName] ? (monthName !== month ? this.state.consumTable[monthName].toString() : value) : '0');
            });
            if (perYear < total || perYear > total) {
                const diff = perYear - total;
                this.setState({
                    consumeError: `Ai modificat numărul de kwh consumați lunar, iar totalul anual este diferit cu ${diff} kWh față de cel declarat. Ajustează consumul în celelalte luni sau corectează consumul anual în conformitate cu noul total obținut`,
                });
            } else {
                this.setState({
                    consumeError: '',
                });
            }
        }
    };

    async handleQuantityChange(e) {
        return new Promise((resolve) => {
            const data = {};
            const yearly = e.target.value;
            data[e.target.name] = yearly;
            this.setState(
                {
                    form: _.extend(this.state.form, data),
                    consumeError: '',
                    consumTable: this.getUsage(this.props.flow, this.props.session[`${this.props.flow}_serviciu`], yearly, true),
                },
                () => {
                    data._consum = this.getUsage(this.props.flow, this.props.session[`${this.props.flow}_serviciu`], yearly);
                    this.setState({
                        form: _.extend(this.state.form, data),
                    });
                    if (this.props.flow === 'gaz' && this.props.session.contract_type === 'b2c') {
                        this.setState({
                            form: {
                                ...this.state.form,
                                _loc: {
                                    ...this.state.form._loc,
                                    categorie: GasConsumptionCategories.C1_1,
                                },
                            },
                        });

                        if (this.state.form._cantitate_anuala < 50) {
                            this.setState({
                                showWarningConsumGas: true,
                            });
                        } else {
                            this.setState({
                                showWarningConsumGas: false,
                            });
                        }

                    } else if (this.props.flow === 'gaz' && this.props.session.contract_type === 'b2b') {
                        let cat = GasConsumptionCategories.C1_1;
                        if (this.state.form._cantitate_anuala <= 280000) {
                            if (this.state.form._cantitate_anuala <= GasConsumptionThresholds.C1_1_MAX) {
                                cat = GasConsumptionCategories.C1_1;
                            } else if (this.state.form._cantitate_anuala > GasConsumptionThresholds.C1_2_MIN && this.state.form._cantitate_anuala <= GasConsumptionThresholds.C1_2_MAX) {
                                cat = GasConsumptionCategories.C1_2;
                            } else if (this.state.form._cantitate_anuala > GasConsumptionThresholds.C1_3_MIN && this.state.form._cantitate_anuala <= GasConsumptionThresholds.C1_3_MAX) {
                                cat = GasConsumptionCategories.C1_3;
                            }
                        } else if (this.state.form._cantitate_anuala > 280000 && this.state.form._cantitate_anuala <= 2800000) {
                            cat = 'C2';
                        } else if (this.state.form._cantitate_anuala > 2800000 && this.state.form._cantitate_anuala <= 28000000) {
                            cat = 'C3';
                        } else if (this.state.form._cantitate_anuala > 28000000 && this.state.form._cantitate_anuala <= 280000000) {
                            cat = 'C4';
                        } else if (this.state.form._cantitate_anuala > 280000000) {
                            cat = 'C5';
                        }

                        if (this.state.form._loc.categorie !== null && this.state.form._loc.categorie !== cat) {
                            this.setState({
                                showWarningConsum: true,
                            });
                        }

                        if (this.state.form._cantitate_anuala < 100) {
                            this.setState({
                                showWarningConsumGas: true,
                            });
                        } else {
                            this.setState({
                                showWarningConsumGas: false,
                            });
                        }

                        this.setState({
                            form: {
                                ...this.state.form,
                                _loc: {
                                    ...this.state.form._loc,
                                    categorie: cat,
                                },
                            },
                        });
                    }
                    if (this.state.form._cantitate_anuala) {
                        resolve(true);
                    }
                }
            );
        });
    }

    handleCategoryChange(e) {
        const data = {};
        data[e.target.name] = e.target.value;

        let perYear = 0;

        switch (e.target.value) {
            default:
            case GasConsumptionCategories.C1_2:
                perYear = 9000;
                break;
            // case 'B2':
            //     perYear = 53740;
            //     break;
            // case 'B3':
            //     perYear = 315000;
            //     break;
        }

        this.setState({
            form: _.extend(this.state.form, {
                _cantitate_anuala: perYear,
                _consum: this.getUsage(this.props.flow, this.props.session[`${this.props.flow}_serviciu`], perYear),
                _loc: _.extend(this.state.form._loc, data),
            }),
            consumTable: this.getUsage(this.props.flow, this.props.session[`${this.props.flow}_serviciu`], perYear, true),
        });
    }

    handleCountyChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                _factura: _.extend(this.state.form._factura, {
                    judet: e.target.value,
                    localitate: '',
                    strada: '',
                }),
            }),
        });
        this.props.fetchCities(e.target.value);
    }

    handleCityChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                _factura: _.extend(this.state.form._factura, {
                    localitate: e.target.value,
                    strada: '',
                }),
            }),
        });
        this.props.fetchStreets(this.state.form.tip_artera, e.target.value);
    }

    handleMonthlyToggle(e) {
        let state = {
            showMonthly: !this.state.showMonthly,
        };

        // if (this.props.flow !== 'gaz') {
        state = {
            ...state,
            form: {
                ...this.state.form,
                _loc: {
                    consum_conventie: !this.state.showMonthly,
                },
            },
        };
        // }
        this.setState(state);
    }

    handleHiddenMetersToggle(e) {
        this.setState({
            showHiddenMeters: !this.state.showHiddenMeters,
        });
    }

    handleDigitalInvoiceChange(e) {
        const { email, telefon_mobil } = this.props.session.contract_type === 'b2c' ? this.props.session.client : this.props.session.company.data;
        const value = e.target.value;
        const data = {};
        if (value === 'MAIL') {
            data.email = this.state.form._factura.email || email;
        } else if (value === 'SMS') {
            data.telefon_mobil = this.state.form._factura.telefon_mobil || telefon_mobil;
        } else {
            data.email = '';
            data.telefon_mobil = '';
        }
        if (value) {
            this.setState({
                form: {
                    ...this.state.form,
                    _factura: {
                        ...this.state.form._factura,
                        ...data,
                        mod_corespondenta: value,
                    },
                },
            });
        }
    }

    handleAggrementAccept(e) {
        const value = e.target.value;
        this.setState({
            acceptAgreement: value,
        });
    }

    async handleInvoiceConfirm(e) {
        e.preventDefault();
        const { email } = this.props.session.contract_type === 'b2c' ? this.props.session.client : this.props.session.company.data;
        this.setState(
            {
                form: _.extend(this.state.form, {
                    _factura: _.extend(this.state.form._factura, {
                        mod_corespondenta: 'MAIL',
                        email,
                    }),
                }),
                showInvoiceOverlay: false,
            },
            async () => {
                const { form } = this.state;
                await this.props.patchSession(form);
                pageService.scrollToTop();
                browserHistory.push(pageService.links['marketing-options']);
            }
        );
    }

    async handleInvoiceDismiss(e) {
        e.preventDefault();
        const { form } = this.state;
        await this.props.patchSession(form);
        pageService.scrollToTop();
        browserHistory.push(pageService.links['marketing-options']);
    }

    async handleIndexWarningDismiss() {
        this.setState({ showIndexWarningMessage: false })
    }

    noErrors() {
        if (!_.isNil(_.find(this.state.formErrors, (section) => section.length > 0)) && !this.validateConsumWithMonths('')) return false;
        return !(this.form.getChildContext()._errors.length > 0);
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({
            formErrors: _.extend(this.state.formErrors, formErrors),
        });
    }

    validateOfferValidity() {
        const { formErrors } = this.state;

        const validity = moment(this.state.form._furnizor_data_start).add(this.props.session.perioada_furnizare, 'months');
        const expire = moment(this.props.session[`${this.props.flow}_serviciu`].pana_la_furn);

        if (validity.isAfter(expire)) {
            formErrors.validity.push('Perioada de furnizare este în afara valabilității ofertei. Pentru mai multe detalii sună la 0800 07 07 01.');
        }

        this.setState({
            formErrors,
        });
    }

    async handleNextClick(e) {
        if (e) e.preventDefault();

        let delivery = "";
        let gaIndex = "";
        this.resetFormErrors();
        this.form.validateAll();
        if (this.props.flow === 'gaz' && this.props.session.contract_type === 'b2c') {
            if (parseInt(this.state.form._cantitate_anuala) > 280000) {
                const { formErrors } = this.state;
                formErrors.validity.push(
                    'Dacă consumul declarat este cel corect, te rugăm să contactezi un reprezentant PPC printr-un mesaj în secțiunea Raportează o problemă'
                );
                this.setState({ formErrors });
                pageService.scrollToError();
                return;
            }
        }
        if (this.props.flow === 'gaz' && this.props.session.contract_type === 'b2b') {
            if (parseInt(this.state.form._cantitate_anuala) > 280000) {
                const { formErrors } = this.state;
                formErrors.validity.push(
                    'Consumul introdus nu este identic cu cel introdus în primul pas. Te rugăm să te asiguri că valoarea introdusă este corectă (în Kwh).'
                );
                this.setState({ formErrors });
                pageService.scrollToError();
                return;
            }
        }
        if (!this.state.acceptAgreement) {
            const { formErrors } = this.state;
            formErrors.validity.push('Nu se poate continua procesul fara confirmarea Termenilor si Conditiilor');
            this.setState({ formErrors });
            pageService.scrollToError();
            return;
        }
        this.validateOfferValidity();
        if (this.state.form._factura.mod_corespondenta == 'MAIL') {
            delivery = "mail";
            try {
                await this.props.prevalidateEmailCfe('email', this.state.form._factura.email);
            } catch (err) {
                const { formErrors } = this.state;
                formErrors.validity.push(err.message);
                this.setState({ formErrors });
            }
        } else if (this.state.form._factura.mod_corespondenta == 'SMS') {
            delivery = "sms"
            try {
                await this.props.prevalidateEmailCfe('phone', this.state.form._factura.telefon_mobil);
            } catch (err) {
                const { formErrors } = this.state;
                formErrors.validity.push(err.message);
                this.setState({ formErrors });
            }
        }

        if (!this.validateConsumWithMonths('')) {
            this.annual_consuption.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }

        const determineIfIndexIsRequired = ({
            podStatus,
            podCnp,
            clientCnp,
            userHasSupplier,
            currentSupplier,
            isChangeOfTitular,
        }) => {
            if (podStatus === 'ACTIV' && podCnp === clientCnp) {
                if (this.props.nlc.piata === 'PR') {
                    return true;
                }
                return false;
            }
            if (podStatus === 'ACTIV' && podCnp !== clientCnp) return true;
            if (podStatus !== 'ACTIV') {
                const enelSuppliersInternalIds = ['T_RO22000460'];
                if (userHasSupplier && enelSuppliersInternalIds.includes(currentSupplier)) {
                    if (isChangeOfTitular === true) return true;
                    return false;
                }

                return true;
            }
        };
        if (!this.noErrors()) {
            return;
        }

        if (this.formErrors.validity.length < 1 && this.validateConsumWithMonths('')) {

            if (
                this.props.nlc &&
                this.props.nlc.status
            ) {

                const validationRequests = [];

                const setIndexErrorRequired = (index) => {
                    validationRequests.push(async () => ({ status: 'NOK', index }))
                }

                const clientCnp = this.props.session.contract_type === 'b2b' ? this.props.session.company.data.cui : this.props.session.client.cnp
                const podCnp = this.props.nlc.cnp_cui

                if (this.props.flow === 'ee') {
                    const isIndexRequired = determineIfIndexIsRequired({
                        podStatus: this.props.nlc.status.toUpperCase(),
                        podCnp,
                        clientCnp,
                        userHasSupplier: this.props.session.ee_are_furnizare_activa,
                        currentSupplier: this.props.session.ee_furnizor_actual,
                        isChangeOfTitular: this.props.session.ee_schimba_titular,
                    })

                    const meas_index_ele_singlerate = this.state.form.measurement_indexes.ELE_SINGLERATE
                    gaIndex = `ee-${this.state.form.measurement_indexes.ELE_SINGLERATE}`

                    if (this.props.nlc.status.toUpperCase() !== 'ACTIV') {
                        if (isIndexRequired && (meas_index_ele_singlerate === undefined || meas_index_ele_singlerate === null || meas_index_ele_singlerate === '')) {
                            setIndexErrorRequired('ENERGIE ACTIVA – RATA UNICA')
                        }
                    } else if (meas_index_ele_singlerate !== undefined && meas_index_ele_singlerate !== null && meas_index_ele_singlerate !== '') {
                    } else if (isIndexRequired) {
                        setIndexErrorRequired('ENERGIE ACTIVA – RATA UNICA')
                    }

                }

                if (this.props.flow === 'gaz') {
                    const isIndexRequired = determineIfIndexIsRequired({
                        podStatus: this.props.nlc.status.toUpperCase(),
                        podCnp,
                        clientCnp,
                        userHasSupplier: this.props.session.gaz_are_furnizare_activa,
                        currentSupplier: this.props.session.gaz_furnizor_actual,
                        isChangeOfTitular: this.props.session.gaz_schimba_titular,
                    })
                    const meas_index_gaz_volum = this.state.form.measurement_indexes.GAS;
                    gaIndex = `gaz-${this.state.form.measurement_indexes.GAS}`
                    if (this.props.nlc.status.toUpperCase() !== 'ACTIV') {
                        if (isIndexRequired && (meas_index_gaz_volum === undefined || meas_index_gaz_volum === null || meas_index_gaz_volum === '')) {
                            setIndexErrorRequired('Volum masurat in conditii baza')
                        }
                    } else if (meas_index_gaz_volum !== undefined && meas_index_gaz_volum !== null && meas_index_gaz_volum !== '') {
                    } else if (isIndexRequired) {
                        setIndexErrorRequired('Volum masurat in conditii baza')
                    }
                }

                const results = await Promise.all(validationRequests.map((f) => f()));
                const indexesWithErrors = results.filter(({ status }) => status === 'NOK');

                if (indexesWithErrors.length > 0) {
                    this.setState((state) => ({
                        ...state,
                        indexesWithErrors,
                        showIndexValidationErrorOverlay: true,
                    }));
                    return;
                }
            }

            const { form } = this.state;
            form._loc.eneltel = this.state.form._factura.avans == 'FACTURA' ? null : this.props.nlc.eneltelCode || '';

            if (this.props.flow != 'gaz') {
                delete form._loc.categorie;
            }

            if (this.state.form._factura.mod_corespondenta == 'MAIL' || this.state.form._factura.mod_corespondenta == 'SMS') {
                await this.props.patchSession(form);
                pageService.scrollToTop();
                const { session } = this.props
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'online_contract',
                    'step': 12,
                    'invoice_delivery': delivery,
                    'compensation_method': this.state.form._factura.avans,
                    'index': gaIndex,
                    'client_type': session.contract_type === "b2c" ? "residential" : "business",
                    'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                });

                browserHistory.push(pageService.links['marketing-options']);
            } else {
                this.setState({
                    showInvoiceOverlay: true,
                });
            }
        } else {
            pageService.scrollToError();
        }
    }

    renderFormErrors(section) {
        if (this.state.formErrors[section].length > 0) {
            return <FormErrors errors={this.state.formErrors[section]} />;
        }
    }

    renderBank() {
        const banks = _.map(this.props.banks, (bank) => ({
            value: bank.cod,
            label: bank.denumire,
        }));

        if (this.state.form._factura.avans == 'BANCA') {
            return (
                <div className="row client-autocomplete">
                    <Input
                        name="iban"
                        label="IBAN"
                        value={this.state.form._factura.iban}
                        onChange={this.handleInputChange}
                        className="form-control"
                        containerClass="mb-3 col-md-12 col-lg-6"
                        validations={[required, iban]}
                    />
                    <Select
                        name="banca"
                        label="Banca"
                        placeholder="Alege"
                        value={this.state.form._factura.banca}
                        className="form-control"
                        containerClass="mb-3 col-md-12 col-lg-6"
                        autocomplete
                        validations={[required]}
                        onSelect={this.handleInputChange}
                        items={banks}
                    />
                </div>
            );
        }
    }

    renderCategory() {
        if (this.props.flow == 'gaz') {
            const categories = [
                {
                    label: 'C1.1',
                    value: GasConsumptionCategories.C1_1,
                },
                {
                    label: 'C1.2',
                    value: GasConsumptionCategories.C1_2,
                },
                {
                    label: 'C1.3',
                    value: GasConsumptionCategories.C1_3,
                },
                {
                    label: 'C2',
                    value: GasConsumptionCategories.C2,
                },
                {
                    label: 'C3',
                    value: GasConsumptionCategories.C3,
                },
                {
                    label: 'C4',
                    value: GasConsumptionCategories.C4,
                },
                {
                    label: 'C5',
                    value: 'C5',
                },
            ];
            return (
                <Select
                    name="categorie"
                    label="Categorie"
                    placeholder="Alege"
                    value={this.state.form._loc.categorie}
                    className="form-control"
                    containerClass="mb-3 col-md-2"
                    validations={[required]}
                    onSelect={this.handleCategoryChange}
                    items={categories}
                    disabled
                />
            );
        }
    }

    renderPressure() {
        if (this.props.flow === 'gaz') {
            return (
                <Fragment>
                    <Input name="pressure" label="Presiune" value={this.state.form._loc.pressure} className="form-control" containerClass="mb-3 col-md-2" type="text" disabled />
                    <Input
                        name="presureLevel"
                        label="Nivel Presiune"
                        value={_.capitalize(this.state.form._loc.presureLevel)}
                        className="form-control"
                        containerClass="mb-3 col-md-2"
                        type="text"
                        disabled
                    />
                </Fragment>
            );
        }
    }

    renderMonthlyToggleButton() {
        /* if (this.props.flow !== 'ee') {
            return (
                <Button className="btn btn-outline-primary show-more btn-full-mobile"
                    onClick={this.handleMonthlyToggle} type="button">
                    {this.renderMonthlyToggleIcon()}
                </Button>
            );
        } else { */
        return (
            <div className="mb-9 col-md-8">
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        className="custom-control-input"
                        id="showMonthlyCheck"
                        checked
                        disabled="disabled"
                    // onClick={this.handleMonthlyToggle}
                    />
                    <label className="custom-control-label" htmlFor="showMonthlyCheck">
                        Conventie consum
                    </label>
                </div>
                <div>
                    <div className="invalid-feedback shown">
                        <span>{this.state.consumeError}</span>
                    </div>
                </div>
            </div>
        );
        // }
    }

    renderMonthlyToggleIcon() {
        if (this.state.showMonthly) {
            return <i className="icon ion-chevron-up"></i>;
        }

        return <i className="icon ion-chevron-down"></i>;
    }

    renderPutereAvizata() {
        if (
            this.props.flow == 'ee' &&
            this.props.session.contract_type == 'b2b' &&
            ((this.props.session.ee_are_furnizare_activa && this.props.session.ee_schimba_furnizor) || !this.props.session.ee_are_furnizare_activa)
        ) {
            return (
                <Input
                    name="ee_putere_avizata"
                    label="Putere Avizata"
                    value={this.state.form.ee_putere_avizata}
                    onChange={this.handlerPutereAvizataChange}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                    validations={[putereAvizata(this.props.session)]}
                    type="text"
                />
            );
        }

        return null;
    }

    renderMonths() {
        const { flow } = this.props;
        return (
            <div className={`row monthly-usage transition-3s-in-out ${this.state.showMonthly && 'show'}`}>
                <Input
                    name="ianuarie"
                    label="Ianuarie"
                    value={this.state.consumTable.ian}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'ian')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="februarie"
                    label="Februarie"
                    value={this.state.consumTable.feb}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'feb')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="martie"
                    label="Martie"
                    value={this.state.consumTable.mar}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'mar')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="aprilie"
                    label="Aprilie"
                    value={this.state.consumTable.apr}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'apr')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="mai"
                    label="Mai"
                    value={this.state.consumTable.mai}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'mai')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="iunie"
                    label="Iunie"
                    value={this.state.consumTable.iun}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'iun')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="iulie"
                    label="Iulie"
                    value={this.state.consumTable.iul}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'iul')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="august"
                    label="August"
                    value={this.state.consumTable.aug}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'aug')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="septembrie"
                    label="Septembrie"
                    value={this.state.consumTable.sep}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'sep')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="octombrie"
                    label="Octombrie"
                    value={this.state.consumTable.oct}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'oct')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="noiembrie"
                    label="Noiembrie"
                    value={this.state.consumTable.noi}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'noi')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
                <Input
                    name="decembrie"
                    label="Decembrie"
                    value={this.state.consumTable.dec}
                    validations={flow === 'gaz' ? [localFormattedNumber] : [localFormattedNumberWithoutDecimal]}
                    onChange={(e) => this.handleMonthChange(e.target.value, 'dec')}
                    className="form-control"
                    containerClass="mb-3 col-md-4"
                />
            </div>
        );
    }

    handlerPutereAvizataChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                ee_putere_avizata: +e.target.value,
            }),
        });
    }

    validateConsum = () => {
        if (this.props.flow == 'ee' && this.props.session.contract_type == 'b2b') {
            const putereAvizataValue = this.state.form.ee_putere_avizata;
            const locCantitateAnuala = this.state.form._cantitate_anuala;
            const putereAvizataNr = parseFloat(putereAvizataValue);
            if (_.isNumber(putereAvizataNr) && _.isNumber(locCantitateAnuala)) {
                const maxVal = putereAvizataNr * 24 * 365; //
                const anula = parseFloat(locCantitateAnuala);
                if (anula > maxVal && this.props.flow === 'ee') {
                    const msg = `Valoarea maxima acceptata este ${maxVal}kWh.`;
                    return msg;
                }
            }
        }
    };


    validateGasConsumption = () => {
        // const locCantitateAnuala = this.state.form._cantitate_anuala;
        // const locCantitateAnualaNr = parseFloat(locCantitateAnuala);
        // if (this.props.session.contract_type == 'b2b') {
        //     if (locCantitateAnualaNr > 280000) {
        //         return 'Consumul introdus nu este identic cu cel introdus în primul pas. Te rugăm să te asiguri că valoarea introdusă este corectă (în Kwh).';
        //     }
        // } else {
        //     if (locCantitateAnualaNr > 280000) {
        //         return 'Dacă consumul declarat este cel corect, te rugăm să contactezi un reprezentant PPC printr-un mesaj în secțiunea Raportează o problemă.';
        //     }
        // }
    }

    validateConsumWithMonths(val) {
        if (this.props.flow !== 'gaz') {
            const perYear = parseFloat(this.state.form._cantitate_anuala || 0);
            let total = 0;

            this.monthNames.forEach((monthName) => {
                total += parseFloat(this.state.consumTable[monthName] ? this.state.consumTable[monthName].toString() : '0');
            });
            if (perYear < total || perYear > total) {
                const diff = perYear - total;
                this.state.consumeError = `Ai modificat numărul de kwh consumați lunar, iar totalul anual este diferit cu ${diff} kWh față de cel declarat. Ajustează consumul în celelalte luni sau corectează consumul anual în conformitate cu noul total obținut`;
                return false;
            }
        }

        return true;
    }


    isProductChangeOrTransferFlow() {
        const { flow, session } = this.props;

        const swTitular = session[`${flow}_schimba_titular`];
        const supply = session[`${flow}_are_furnizare_activa`];

        const supplier = session[`${flow}_loc`]['furnizor_id'];

        if (!supply || !supplier) {
            return false;
        }


        const PPCInternalIds = ['T_RO22000460'];
        const swSupplier = !PPCInternalIds.includes(supplier);

        return !!(
            (supply && !swSupplier && !swTitular) ||
            (supply && !swSupplier && swTitular)
        );
    }

    render() {
        const counties = _.map(this.props.counties, (v) => ({
            value: v.denumire,
            label: v.denumire,
        }));
        const cities = _.map(this.getFilteredCities(), (v) => ({
            value: v.internal_id,
            label: v.denumire,
        }));
        const streetTypes = _.map(this.props.streetTypes, (v) => ({
            value: v.cod,
            label: v.cod,
        }));
        const streets = _.map(this.getFilteredStreets(), (v) => ({
            value: v.internal_id,
            label: v.denumire,
        }));

        const prepayments = [
            {
                value: 'FACTURA',
                label: 'Compensare pe facturi',
            },
            {
                value: 'BANCA',
                label: 'Transfer bancar',
            },
            {
                value: 'POSTA',
                label: 'Mandat poștal',
            },
        ];
        const addresses = [
            {
                value: `${this.props.flow}_loc`,
                label: 'Aceeași cu cea de consum',
            },
            {
                value: 'client',
                label: 'Aceeași cu cea de domiciliu',
            },
            {
                value: 'new',
                label: 'Altă adresă (completează)',
            },
        ];

        const isPLMarketContract = this.isPLMarketContract();

        return (
            <div className="ContractOptions">
                <ConfirmOverlay
                    title="Factură electronică?"
                    description="Activează-ți Corespondența și Factura Electronică și bucură-te de avantaje multiple: primești factura imediat ce se emite, direct în căsuța ta de e-mail, și nu mai stai cu grija pierderii acesteia pe drum sau în căsuța poștală a vecinilor."
                    confirmLabel="Activează"
                    dismissLabel="Ignoră"
                    show={this.state.showInvoiceOverlay}
                    onDismiss={this.handleInvoiceDismiss}
                    onConfirm={this.handleInvoiceConfirm}
                />

                <ConfirmOverlay
                    title='Atentie!'
                    description="Atentie! Indexul introdus este mai mare decat consum anual!"
                    confirmLabel="Inchide"
                    show={this.state.showIndexWarningMessage}
                    onConfirm={this.handleIndexWarningDismiss}
                    onlyOkButton
                />

                <ConfirmOverlay
                    title="Index Validation error"
                    description={`Index nevalidat pe cadranul(e): ${this.state.indexesWithErrors.map(({ index }) => index).toString()}`}
                    confirmLabel="Reinsereaza"
                    dismissLabel="Continua"
                    show={this.state.showIndexValidationErrorOverlay}
                    onDismiss={async () => {
                        this.setState(
                            (state) => ({
                                ...state,
                                continueWithoutChangingIndexes: true,
                                showIndexValidationErrorOverlay: false,
                            }),
                            () => {
                                this.handleNextClick();
                            }
                        );
                    }}
                    onConfirm={() => {
                        this.setState((state) => ({
                            ...state,
                            showIndexValidationErrorOverlay: false,
                        }));
                    }}
                />
                <HeaderHero title="Opțiuni contractuale" backgroundColor="#55be5a" showRegistrationInfo />
                <div className="main-content bottom-margin">
                    <div className="row">
                        <Form
                            className="needs-validation"
                            key={this.state.formKey}
                            ref={(c) => {
                                this.form = c;
                            }}
                        >
                            <fieldset>
                                <div className="order-md-1 col-md-12">
                                    {this.renderFormErrors('validity')}
                                    <h4 className="mb-3">Mod distribuire factură</h4>
                                    <div className="row">
                                        <div className="mb-3 col-md-12">
                                            <div className="custom-control custom-checkbox ">
                                                <input type="checkbox" className="custom-control-input" id="accept-aggrement" name="communication" onChange={this.handleAggrementAccept} />
                                                <label className="custom-control-label" htmlFor="accept-aggrement">
                                                    {' '}
                                                    <a target="_blank" href="https://digital.ppcenergy.ro/tc" rel="noreferrer">
                                                        {' '}
                                                        Am citit si accept Termenii și condițiile privind transmiterea corespondenței și facturii PPC
                                                    </a>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-4">
                                            <div className="custom-control custom-radio ">
                                                <input
                                                    type="radio"
                                                    className="custom-control-input"
                                                    id="accept-email"
                                                    name="communication"
                                                    value="MAIL"
                                                    checked={this.state.form._factura.mod_corespondenta === 'MAIL'}
                                                    onChange={this.handleDigitalInvoiceChange}
                                                />
                                                <label className="custom-control-label" htmlFor="accept-email">
                                                    {this.props.session.contract_type === 'b2b' ? 'Trimite anexa la factura prin e-mail' : 'Trimite factura pe e-mail'}
                                                </label>
                                            </div>
                                        </div>
                                        {this.props.session.contract_type === 'b2c' && (
                                            <div className="mb-3 col-md-4">
                                                <div className="custom-control custom-radio ">
                                                    <input
                                                        type="radio"
                                                        className="custom-control-input"
                                                        id="accept-phone"
                                                        name="communication"
                                                        value="SMS"
                                                        checked={this.state.form._factura.mod_corespondenta === 'SMS'}
                                                        onChange={this.handleDigitalInvoiceChange}
                                                    />
                                                    <label className="custom-control-label" htmlFor="accept-phone">
                                                        Trimite factura pe sms
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                        {!this.hasCFE() && this.props.session.contract_type === 'b2c' && (
                                            <div className="mb-3 col-md-4">
                                                <div className="custom-control custom-radio">
                                                    <input
                                                        type="radio"
                                                        className="custom-control-input"
                                                        id="accept-post"
                                                        name="communication"
                                                        value="POSTA"
                                                        checked={this.state.form._factura.mod_corespondenta === 'POSTA'}
                                                        onChange={this.handleDigitalInvoiceChange}
                                                    />
                                                    <label className="custom-control-label" htmlFor="accept-post">
                                                        Trimite factura prin posta
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {this.state.form._factura.mod_corespondenta === 'MAIL' && (
                                        <div className="row">
                                            <Input
                                                name="email"
                                                label="E-mail"
                                                value={this.state.form._factura.email}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                containerClass="mb-3 col-md-12 col-lg-6"
                                                validations={[email, required]}
                                            />
                                        </div>
                                    )}
                                    {this.state.form._factura.mod_corespondenta === 'SMS' && (
                                        <div className="row">
                                            <Input
                                                name="telefon_mobil"
                                                label="Telefon"
                                                value={this.state.form._factura.telefon_mobil}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                containerClass="mb-3 col-md-12 col-lg-6"
                                                validations={[tel, required]}
                                            />
                                        </div>
                                    )}
                                    {!isPLMarketContract && (
                                        <Fragment>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="address"
                                                    label="Adresa de corespondență"
                                                    placeholder="Alege"
                                                    value={this.state.address}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6 col-lg-12"
                                                    onSelect={this.handleAddressChange}
                                                    validations={[required]}
                                                    items={addresses}
                                                />
                                            </div>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="judet"
                                                    label="Județ"
                                                    placeholder="Alege"
                                                    value={this.state.form._factura.judet}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleCountyChange}
                                                    items={counties}
                                                    upperCase
                                                />
                                                <Select
                                                    name="localitate"
                                                    label="Localitate"
                                                    placeholder="Alege"
                                                    value={this.state.form._factura.localitate}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleCityChange}
                                                    items={cities}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="tip_artera"
                                                    label="Tip stradă"
                                                    placeholder="Alege"
                                                    value={this.state.form._factura.tip_artera}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    onSelect={this.handleInputChange}
                                                    items={streetTypes}
                                                    upperCase
                                                />
                                                <Select
                                                    name="strada"
                                                    label="Stradă"
                                                    placeholder="Alege"
                                                    value={this.state.form._factura.strada}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleInputChange}
                                                    items={streets}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="nr_strada"
                                                    label="Număr"
                                                    value={this.state.form._factura.nr_strada}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[required, containsDigit, (value) => maxLength(value, 15)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="bloc"
                                                    label="Bloc"
                                                    value={this.state.form._factura.bloc}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[(value) => maxLength(value, 10)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="scara"
                                                    label="Scară"
                                                    value={this.state.form._factura.scara}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[]}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="etaj"
                                                    label="Etaj"
                                                    value={this.state.form._factura.etaj}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="apartament"
                                                    label="Apartament"
                                                    value={this.state.form._factura.apartament}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[(value) => maxLength(value, 15)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="cod_postal"
                                                    label="Cod poștal"
                                                    value={this.state.form._factura.cod_postal}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[codPostal, integer]}
                                                    type="number"
                                                    upperCase
                                                />
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            </fieldset>
                            <Fragment>
                                <fieldset>
                                    <div className="order-md-1 col-md-12">
                                        <h4 className="mb-3">Alte opțiuni</h4>
                                        <div className="row client-autocomplete">
                                            <Select
                                                name="avans"
                                                label="Compensare sume în avans"
                                                placeholder="Alege"
                                                value={this.state.form._factura.avans}
                                                className="form-control"
                                                containerClass="mb-3 col-md-12 col-lg-6"
                                                validations={[required]}
                                                onSelect={this.handlePrepayChange}
                                                items={prepayments}
                                                key={`avans_${this.state.form._factura.avans}`}
                                                upperCase
                                            />
                                        </div>
                                        {this.renderBank()}
                                    </div>
                                </fieldset>
                                <fieldset>{this.renderPutereAvizata()}</fieldset>
                                <fieldset>
                                    <div className="order-md-1 col-md-12">
                                        <h4 className="mb-3">Consum anual estimat</h4>
                                        <div className="row client-autocomplete">
                                            {this.renderCategory()}
                                            {this.renderPressure()}
                                            <Input
                                                name="_cantitate_anuala"
                                                label={this.props.flow === 'gaz' ? 'Anual (KWh)' : 'Anual (kWh)'}
                                                value={this.state.form._cantitate_anuala}
                                                onChange={this.handleQuantityChange}
                                                className="form-control"
                                                innerRef={this.annual_consuption}
                                                containerClass="mb-3 col-md-2"
                                                validations={
                                                    this.props.flow === 'ee' ? (this.props.flow === 'ee' &&
                                                        this.props.nlc &&
                                                        this.props.nlc.status &&
                                                        this.props.nlc.status === 'ACTIV' &&
                                                        this.props.session[`${this.props.flow}_schimba_furnizor`] === false &&
                                                        this.props.session.contract_type !== 'b2b'
                                                        ? [required, integer, this.validateConsum, maxValue(6 * 24 * 365)]
                                                        : [required, integer, this.validateConsum]) : (this.props.session.contract_type !== 'b2b' ? [required, integer, this.validateGasConsumption] : [required, integer, this.validateGasConsumption])
                                                }
                                                type="number"
                                            />
                                            {this.renderMonthlyToggleButton()}
                                        </div>
                                        <div className="row">
                                            {this.props.flow === 'gaz' && this.state.showWarningConsumGas ? (
                                                <div>
                                                    <p className="alert-warning">
                                                        Asigură-te că ai introdus cantitatea în KWh și nu în MWh;
                                                    </p>
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            {/* {this.props.flow === 'gaz' && this.props.session['contract_type'] === 'b2b' && this.state.showWarningConsum ? (
                                                <div>
                                                    <p className="alert-warning">
                                                        Conform cantității introduse, ai trecut la o categorie superioară de consum. Verifică valoarea declarată și asigură-te că ai introdus consumul
                                                        anual în KWh și nu MWh.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div></div>
                                            )} */}
                                        </div>
                                        {this.renderMonths()}
                                    </div>
                                </fieldset>
                                <Fragment>
                                    <fieldset>
                                        <div className="col-sm-12">
                                            <h4 className="mb-3">
                                                Citire index contor{' '}
                                                {this.state.measurementIndexes && this.state.measurementIndexes.SERIE_CONTOR ? `cu seria ${this.state.measurementIndexes.SERIE_CONTOR}` : ''}
                                            </h4>
                                        </div>
                                        <div className="col-sm-12">
                                            {this.props.flow === 'ee' && (
                                                <div className="row client-autocomplete">
                                                    <div className="col-sm-12 order-md-1">
                                                        <h4 className="mb-3">Energia Activa</h4>
                                                    </div>
                                                    <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                        <Accordion defaultExpanded>
                                                            <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                <Typography>ENERGIE ACTIVA – RATA UNICA</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.0') && (
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="ELE_SINGLERATE_Ultimul"
                                                                            label="Ultimul Index"
                                                                            value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.0').INDEX}
                                                                            type="number"
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="col-sm-6">
                                                                    <Input
                                                                        name="ELE_SINGLERATE"
                                                                        label="Index"
                                                                        onChange={this.handleMeasurementChange}
                                                                        validations={[integer, (value) => {
                                                                            const oldIndex = this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.0') && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.0').INDEX;
                                                                            if (oldIndex && value) {
                                                                                if (Number(oldIndex) > Number(value)) {
                                                                                    return `Valoarea minima acceptata este: ${oldIndex}`
                                                                                }
                                                                            }
                                                                        }]}
                                                                        validateOnBlur
                                                                        value={this.state.form.measurement_indexes.ELE_SINGLERATE}
                                                                        type="number"
                                                                    />
                                                                </div>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </div>
                                                    {!this.state.showHiddenMeters && (
                                                        <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                            <Button className="btn btn-outline-primary btn-full-mobile dropdown-toggle" onClick={this.handleHiddenMetersToggle} />
                                                        </div>
                                                    )}
                                                    {this.state.showHiddenMeters && (
                                                        <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                            <Accordion defaultExpanded>
                                                                <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                    <Typography>ENERGIE ACTIVĂ ZONĂ 1: VÂRF / ZI</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.1') && (
                                                                        <div className="col-sm-6">
                                                                            <Input
                                                                                name="ELE_DAY_Ultimul"
                                                                                label="Ultimul Index"
                                                                                value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.1').INDEX}
                                                                                type="number"
                                                                                readOnly
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="ELE_DAY"
                                                                            label="Index"
                                                                            onChange={this.handleMeasurementChange}
                                                                            validations={[integer]}
                                                                            value={this.state.form.measurement_indexes.ELE_DAY}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </div>
                                                    )}
                                                    {this.state.showHiddenMeters && (
                                                        <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                            <Accordion defaultExpanded>
                                                                <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                    <Typography>ENERGIE ACTIVĂ ZONĂ 2: REST, NOAPTE</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.2') && (
                                                                        <div className="col-sm-6">
                                                                            <Input
                                                                                name="ELE_NIGHT_Ultimul"
                                                                                label="Ultimul Index"
                                                                                value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.2').INDEX}
                                                                                type="number"
                                                                                readOnly
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="ELE_NIGHT"
                                                                            label="Index"
                                                                            onChange={this.handleMeasurementChange}
                                                                            validations={[integer]}
                                                                            value={this.state.form.measurement_indexes.ELE_NIGHT}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </div>
                                                    )}
                                                    {this.state.showHiddenMeters && (
                                                        <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                            <Accordion defaultExpanded>
                                                                <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                    <Typography>ENERGIE ACTIVĂ ZONĂ 3: GOL</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.3') && (
                                                                        <div className="col-sm-6">
                                                                            <Input
                                                                                name="ELE_GOAL_Ultimul"
                                                                                label="Ultimul Index"
                                                                                value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '1.8.3').INDEX}
                                                                                type="number"
                                                                                readOnly
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="ELE_GOAL"
                                                                            label="Index"
                                                                            onChange={this.handleMeasurementChange}
                                                                            validations={[integer]}
                                                                            value={this.state.form.measurement_indexes.ELE_GOAL}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </div>
                                                    )}
                                                    {this.state.showHiddenMeters && <Fragment>
                                                        <div className="col-sm-12 order-md-1">
                                                            <h4 className="mb-3">Energia Reactiva</h4>
                                                        </div>
                                                        <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                            <Accordion defaultExpanded>
                                                                <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                    <Typography>ENERGIE REACTIVA INDUCTIVĂ</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {this.state.measurementIndexes &&
                                                                        this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '5.8.0') && (
                                                                            <div className="col-sm-6">
                                                                                <Input
                                                                                    name="ELE_INDUCTIVE_Ultimul"
                                                                                    label="Ultimul Index"
                                                                                    value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '5.8.0').INDEX}
                                                                                    type="number"
                                                                                    readOnly
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="ELE_INDUCTIVE"
                                                                            label="Index"
                                                                            onChange={this.handleMeasurementChange}
                                                                            validations={[integer]}
                                                                            value={this.state.form.measurement_indexes.ELE_INDUCTIVE}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </div>
                                                        <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                            <Accordion defaultExpanded>
                                                                <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                    <Typography>ENERGIE REACTIVA CAPACITIVĂ</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {this.state.measurementIndexes &&
                                                                        this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '8.8.0') && (
                                                                            <div className="col-sm-6">
                                                                                <Input
                                                                                    name="ELE_CAPACITIVE_Ultimul"
                                                                                    label="Ultimul Index"
                                                                                    value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === '8.8.0').INDEX}
                                                                                    type="number"
                                                                                    readOnly
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="ELE_CAPACITIVE"
                                                                            label="Index"
                                                                            onChange={this.handleMeasurementChange}
                                                                            validations={[integer]}
                                                                            value={this.state.form.measurement_indexes.ELE_CAPACITIVE}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </div>
                                                    </Fragment>}
                                                </div>
                                            )}
                                            {this.props.flow === 'gaz' && (
                                                <div className="row client-autocomplete">
                                                    <div className="order-md-1 col-md-6 col-sm-12 vertical-spacing">
                                                        <Accordion defaultExpanded>
                                                            <AccordionSummary aria-controls="panel-activa-rata-unica-content" id="panel-activa-rata-unica-header">
                                                                <Typography>Volum masurat in conditii baza</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === 'VOL') && (
                                                                    <div className="col-sm-6">
                                                                        <Input
                                                                            name="GAS_Ultimul"
                                                                            label="Ultimul Index"
                                                                            value={this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === 'VOL').INDEX}
                                                                            type="number"
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="col-sm-6">
                                                                    <Input
                                                                        name="GAS"
                                                                        label="Index"
                                                                        onChange={this.handleMeasurementChange}
                                                                        validations={[integer, (value) => {
                                                                            const oldIndex = this.state.measurementIndexes && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === 'VOL') && this.state.measurementIndexes.INDEXES.find((indexItem) => indexItem.ID_CADRAN === 'VOL').INDEX;
                                                                            if (oldIndex && value) {
                                                                                if (Number(oldIndex) > Number(value)) {
                                                                                    return `Valoarea minima acceptata este: ${oldIndex}`
                                                                                }
                                                                            }
                                                                        }]}
                                                                        validateOnBlur
                                                                        value={this.state.form.measurement_indexes.GAS}
                                                                        type="number"
                                                                    />
                                                                </div>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </fieldset>
                                </Fragment>
                            </Fragment>
                            <div className="text-center spaced-top spaced-bottom-lg">
                                <Button type="submit" className="btn btn-primary col-12" onClick={this.handleNextClick}>
                                    Continuă
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

ContractOptions.propTypes = propTypes;
ContractOptions.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
    invoice: ocrSelectors.getInvoice(state),
    counties: countiesSelectors.getItems(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    streets: getStreets(state),
    distributors: getDistributors(state),
    session: getSession(state),
    flow: getFlow(state).toLowerCase(),
    banks: getBanks(state),
    nlc: getNLC(state),
    eeProviders: providersSelectors.getItems(state, 'ee'),
    gazProviders: providersSelectors.getItems(state, 'gaz'),
    startDate: getStartDate(state),
});

const mapDispatchToProps = {
    fetchDistributors,
    fetchCities,
    fetchStreets,
    patchSession,
    fetchBanks,
    markAction,
    prevalidateEmailCfe,
    getProviderStartDate,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContractOptions);

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import _ from 'lodash';

import { getUser as getAuthUser } from 'store/auth/selectors';
import { getItems as getProviders } from 'store/providers/selectors';
import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getItems as getDistributors } from 'store/distributors/selectors';
import {
    getClient,
    hasClientSignedAgreement,
    isFastFlux,
    isLinkSent,
} from 'store/client/selectors';
import { getSession, isContractSent } from 'store/session/selectors';
import { getDocs, getTimestamps } from 'store/documents/selectors';
import { getCurrentPlan, isPlanSelected } from 'store/offers/selectors';
import { isDocLoading } from 'store/ui/selectors';

import { setDocLoading, unsetDocLoading } from 'store/ui/actions';
import {
    deleteDoc,
    setDoc,
    unsetID as unsetDocID,
    uploadID,
    uploadInvoice,
    uploadOwnerDocs,
} from 'store/documents/actions';

import {
    codPostal,
    integer,
    laterThanDays,
    maxLength,
    mix,
    required,
    requiredAfter,
    requiredBefore,
    stringWithNumber,
    putereAvizata,
} from 'services/rules';
import offerService from 'services/offer';

import {
    getCityOptions,
    getCountyOptions,
    getStreetOptions,
    getStreetTypeOptions,
} from 'services/form';

import FileService from 'services/file';
import { TYPES } from 'services/documents';
import { ROLES } from 'services/user';

import { Checkbox, Select, Text } from 'components/form';
import { DocList } from 'components/docs/DocList';
import { megaBytesToBytes } from 'utils';

import CustomerDocsSelect from '../CustomerDocsSelect';
import Documents from '../Documents';
import Consumption from '../Consumption';
import ProofOfAddressCustomer from './components/ProofOfAddressCustomer';

import './PodBody.scss';
import moment from 'moment/moment';

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

class PodBody extends Component {
    state = {
        pod: null,
        cropImage: null,
        cropIndex: null,
        docType: '',
        docs: {
            ee: {
                ACT_PROPRIETAR: {
                    title: TYPES.ACT_PROPRIETAR,
                    images: [],
                },
                FACT_CLIENT: {
                    title: TYPES.FACT_CLIENT,
                    images: [],
                },
            },
            gaz: {
                ACT_PROPRIETAR: {
                    title: TYPES.ACT_PROPRIETAR,
                    images: [],
                },
                FACT_CLIENT: {
                    title: TYPES.FACT_CLIENT,
                    images: [],
                },
            },
        },
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        const { flow } = this.props;

        if (flow) {
            _.map(TYPES, (value, key) => {
                const docsFirstLoaded =
                    prevProps.docs[flow.toLowerCase()] &&
                    !prevProps.docs[flow.toLowerCase()][key] &&
                    this.props.docs[flow.toLowerCase()][key] &&
                    this.props.docs[flow.toLowerCase()][key].length > 0;

                const docsUpdated =
                    prevProps.timestamps[flow.toLowerCase()][key] !==
                    this.props.timestamps[flow.toLowerCase()][key];

                if (docsFirstLoaded || docsUpdated) {
                    this.setImages(this.props.docs[flow.toLowerCase()][key], key, 0);
                }
            });
        }
    }

    didClientSign() {
        return (
            this.props.timestamps &&
            (!_.isEmpty(this.props.timestamps.ee) || !_.isEmpty(this.props.timestamps.gaz))
        );
    }

    isAddressDisabled() {
        const { nlc } = this.props;
        return !!nlc.districtId && nlc.status !== 'NOK';
    }

    getDocOptions(index) {
        return [
            { value: 'CER', label: TYPES.CER },
            { value: 'ATR', label: TYPES.ATR },
            { value: 'DOC_ACORD_ACCES', label: TYPES.DOC_ACORD_ACCES },
        ];
    }

    cleanDocs(docs, docType) {
        if (docType) {
            const { flow } = this.props;
            const docsKey = Object.keys(docs[flow]);
            for (let i = 0; i < docsKey.length; i++) {
                const docKey = docsKey[i];
                if (
                    docKey !== 'FACT_CLIENT' &&
                    docKey !== 'ACT_PROPRIETAR' &&
                    docKey !== docType &&
                    docs[flow][docKey].images.length === 0
                ) {
                    delete docs[flow][docKey];
                    this.setState({
                        docs,
                    });
                }
            }
        }
    }

    initDoc(docs, newDocType, images = []) {
        const { flow } = this.props;
        if (!docs[flow][newDocType]) {
            docs[flow][newDocType] = {
                title: TYPES[newDocType],
                images,
            };
            this.setState({ docs });
        }
    }

    async uploadDocs(images) {
        const { setDocLoading, unsetDocLoading, flow } = this.props;
        const { docType } = this.state;

        setDocLoading(flow, docType);
        if (docType === 'FACT_CLIENT') {
            await this.props.uploadInvoice(images, flow.toUpperCase());
        } else {
            await this.props.uploadOwnerDocs(images, docType, flow.toUpperCase());
        }
        unsetDocLoading(flow, docType);
    }

    setImages(images, docType, podIndex) {
        return new Promise(resolve => {
            const { flow } = this.props;
            const type = docType || this.state.docType;
            let docs = { ...this.state.docs };
            if (!docs[flow][type]) {
                this.initDoc(docs, type, images);
            } else {
                docs[flow][type].images = [...images];
            }
            this.props.setDoc([...docs[flow][type].images], type, flow);
            resolve();
        });
    }

    addImages(images, docType) {
        return new Promise(resolve => {
            const { flow } = this.props;
            const type = docType || this.state.docType;
            let docs = { ...this.state.docs };
            if (!docs[flow][type]) {
                this.initDoc(docs, type, images);
                this.props.setDoc([...images], type, flow);
                resolve([...images]);
            } else {
                docs[flow][type].images = docs[flow][type].images.concat(images);
                this.props.setDoc([...docs[flow][type].images], type, flow);
                resolve([...docs[flow][type].images]);
            }
        });
    }

    canUploadDocs() {
        const { authUser, isFastFlux, hasClientSignedAgreement } = this.props;
        return (
            !isFastFlux &&
            authUser &&
            (authUser.role === ROLES.CM || authUser.role === ROLES.AGENT) &&
            hasClientSignedAgreement
        );
    }

    handleIndexChange(e) {
        this.setState({ podIndexChanged: true });
    }

    handleOwnerChange(e) {
        const { onOwnerChange } = this.props;
        if (onOwnerChange) onOwnerChange(e);
        this.setState({ updated: true });
    }

    async handleDocSelect(file, docType) {
        setTimeout(async () => {
            const images = await FileService.readImages(file);
            this.setState({ docType }, async () => {
                const uploadImages = await this.addImages(images, docType);
                await this.uploadDocs(uploadImages);
            });
        }, 250);
    }

    async handleImageDelete(docIndex, imageIndex) {
        const { setDocLoading, unsetDocLoading, flow } = this.props;
        let docs = { ...this.state.docs };
        docs[flow][docIndex].images.splice(imageIndex, 1);
        this.cleanDocs(docs, docIndex);

        if (docs[flow][docIndex].images.length > 0) {
            this.setState({ docType: docIndex }, () => {
                this.uploadDocs(docs[flow][docIndex].images);
            });
        } else {
            setDocLoading(flow, docIndex);
            await this.props.deleteDoc(docIndex, flow.toUpperCase());
            unsetDocLoading(flow, docIndex);
        }
        this.setState({ docs }, () => {
            this.props.setDoc([...docs[flow][docIndex].images], docIndex, flow);
        });
    }

    handleDocTypeSelect(e) {
        const newDocType = e.target.value;
        if (newDocType) {
            let { docs } = this.state;
            this.setState({
                docType: newDocType,
            });
            this.initDoc(docs, newDocType, []);
            this.cleanDocs(docs, newDocType);
        }
    }

    renderProvider() {
        const { isLinkSent, isActive, flow, nlc, index, onProviderChange } = this.props;
        if (isActive) {
            return (
                <div className="row">
                    <Select
                        className="col-md-12"
                        label="Care este furnizorul tău actual?"
                        name={`furnizor_actual-${index}`}
                        options={_.map(this.props[`${flow}Providers`], v => ({
                            value: v.internal_id,
                            label: v.denumire,
                        }))}
                        validate={requiredBefore(isLinkSent)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent || (nlc.status === 'ACTIV' && nlc.supplyerId)}
                        onChange={onProviderChange}
                        autocomplete
                    />
                </div>
            );
        }
    }

    renderGeneralData() {
        const { isLinkSent, showNLC, disableNLC, index, nlc, authUser, formApi } = this.props;
        if (formApi) {
            let initialValue = EE;
            const isENELArea =
                (nlc.status === 'ACTIV' && (nlc.supplyerId === EE || nlc.supplyerId === EEM)) ||
                ((nlc.status === 'INACTIV' || nlc.status === 'NOK') &&
                    Object.keys(ENEL_AREAS).includes(nlc.districtId));
            if (isENELArea) {
                // if (nlc.status !== 'ACTIV') {
                initialValue =
                    (nlc.status === 'ACTIV' && nlc.supplyerId) ||
                    ((nlc.status === 'INACTIV' || nlc.status === 'NOK') &&
                        ENEL_AREAS[nlc.districtId]);
                // }
            } else if (
                authUser.furnizor ||
                (authUser.furnizorImputernicit && authUser.furnizorImputernicit.length === 1)
            ) {
                const mapFurnizorNameToId = { EE: EE, EEM: EEM };
                initialValue =
                    mapFurnizorNameToId[authUser.furnizor] ||
                    mapFurnizorNameToId[authUser.furnizorImputernicit[0]];
            }
            formApi.setValue(`furnizor_viitor-${index}`, initialValue);
            return (
                <Fragment>
                    <div className="group-name">DATE GENERALE</div>
                    <div className="row">
                        {this.renderDistributor()}
                        {showNLC && (
                            <Text
                                className="col-md-6"
                                label="Cod Loc Consum (NLC)"
                                name={`loc_nlc-${index}`}
                                validate={requiredBefore(isLinkSent)}
                                highlight={!isLinkSent}
                                disabled={disableNLC || isLinkSent}
                            />
                        )}
                    </div>
                    <div className="row">
                        <Select
                            className="col-md-6"
                            label="Furnizor"
                            name={`furnizor_viitor-${index}`}
                            options={[
                                {
                                    value: EE,
                                    label: 'PPC Energie',
                                },
                                {
                                    value: EEM,
                                    label: 'PPC Energie Muntenia',
                                },
                            ]}
                            validate={requiredBefore(isLinkSent)}
                            highlight={!isLinkSent}
                            disabled={
                                isLinkSent ||
                                isENELArea ||
                                (authUser.furnizorImputernicit &&
                                    authUser.furnizorImputernicit.length === 1)
                            }
                            autocomplete
                        />
                    </div>
                </Fragment>
            );
        }
    }

    renderDistributor() {
        const { distributors, isLinkSent, flow, index, onDistributorChange } = this.props;
        if (flow === 'gaz') {
            const items = _.filter(distributors, distributor => distributor.gaz);
            return (
                <Select
                    className="col-md-6"
                    label="Distribuitor"
                    name={`loc_distribuitor_id-${index}`}
                    options={_.map(items, v => ({
                        value: v.internal_id,
                        label: v.denumire,
                    }))}
                    validate={requiredBefore(isLinkSent)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent}
                    onChange={onDistributorChange}
                    autocomplete
                />
            );
        }

        const items = _.filter(distributors, distributor => distributor.ee);
        return (
            <Select
                className="col-md-6"
                label="Distribuitor"
                name={`loc_distribuitor_id-${index}`}
                options={_.map(items, v => ({
                    value: v.internal_id,
                    label: v.denumire,
                }))}
                validate={requiredBefore(isLinkSent)}
                highlight={!isLinkSent}
                disabled={isLinkSent}
                onChange={onDistributorChange}
                autocomplete
                //disabled
            />
        );
    }

    renderGasConsumer() {
        const { index, flow, isContractSent } = this.props;
        if (flow === 'ee') {
            return (
                <div className="row">
                    <Checkbox
                        className="col-md-12"
                        name={`loc_consumator_gaze-${index}`}
                        label="Consumator gaze naturale"
                        disabled={isContractSent}
                    />
                </div>
            );
        }
    }

    renderValidity(index) {
        const {
            isContractSent,
            formApi,
            shouldRenderPlaceDocs,
            onValidityChange,
            isPlaceStatementChecked,
        } = this.props;
        if (formApi && shouldRenderPlaceDocs) {
            const { values } = formApi.getState();
            return (
                <div className="row">
                    <Select
                        className="col-md-6"
                        label="Valabilitate act spatiu"
                        name={`tip_valabilitate-${index}`}
                        options={[
                            {
                                label: 'Nedeterminată',
                                value: false,
                            },
                            {
                                label: 'Determinată',
                                value: true,
                            },
                        ]}
                        validate={isPlaceStatementChecked ? null : required}
                        onChange={() => this.setState({ validityChange: true })}
                        highlight={!isContractSent}
                        disabled={isContractSent || isPlaceStatementChecked}
                    />
                    {values[`tip_valabilitate-${index}`] && (
                        <Text
                            className="col-md-6"
                            label="Valabil pana la"
                            name={`valabilitate-${index}`}
                            validate={mix(required, laterThanDays(30))}
                            type="date"
                            onChange={onValidityChange}
                            highlight={!isContractSent}
                            disabled={isContractSent || isPlaceStatementChecked}
                        />
                    )}
                </div>
            );
        }
    }

    renderPlaceStatement() {
        const {
            session,
            flow,
            index,
            counties,
            isLinkSent,
            formApi,
            onStatementChange,
            nlc,
        } = this.props;

        if (formApi) {
            const county = _.find(
                counties,
                item => item.denumire === formApi.getValue(`loc_judet-${index}`)
            );
            if (county) {
                const isActivePODFromEnelArea =
                    !_.isNil(county) &&
                    county.distribution &&
                    !_.isNil(county.distribution.distributie_enel) &&
                    county.distribution.distributie_enel === 'D' &&
                    nlc &&
                    nlc.status === 'ACTIV';
                if (
                    offerService.enablePlaceStatement({
                        period: session.perioada_furnizare,
                        changeOwner: formApi.getValue(`schimba_titular-${index}`),
                        isActivePODFromEnelArea,
                    })
                ) {
                    return (
                        <Fragment>
                            {flow && (
                                <Fragment>
                                    <div className="group-name">DECLARAŢIE ACT SPATIU</div>
                                    <div className="row">
                                        <Checkbox
                                            className="col-md-12"
                                            name={`loc_declaratie_act_spatiu-${index}`}
                                            label="Foloseste Declaratia Act Spatiu"
                                            disabled={isLinkSent}
                                            id="declaratie-act-spatiu"
                                            onChange={onStatementChange}
                                            initialValue={
                                                session && session[`${flow}_loc`]
                                                    ? session[`${flow}_loc`].declaratie_act_spatiu
                                                    : false
                                            }
                                        />
                                    </div>
                                </Fragment>
                            )}
                            {flow && this.props.isPlaceStatementChecked && (
                                <ProofOfAddressCustomer
                                    index={index}
                                    place={session[`${flow}_loc`]}
                                    supply={formApi.getValue(`are_furnizare_activa-${index}`)}
                                    sw_titular={formApi.getValue(`schimba_titular-${index}`)}
                                    sw_provider={this.props.getProviderChange(index)}
                                />
                            )}
                        </Fragment>
                    );
                }
            }
        }
    }

    renderIndexDate(index) {
        const { isContractSent, formApi } = this.props;
        if (formApi && formApi.getValue(`loc_index-${index}`)) {
            return (
                <Text
                    className="col-md-4"
                    label="Dată index"
                    name={`loc_data_reziliere-${index}`}
                    validate={required}
                    type="date"
                    disabled={isContractSent}
                    highlight
                />
            );
        }
    }

    renderContractNumber(index) {
        const { isContractSent, shouldRenderContractNumber } = this.props;
        if (shouldRenderContractNumber) {
            return (
                <div className="row">
                    <Text
                        className="col-md-6"
                        label="Număr contract"
                        name={`loc_nr_contract_actual-${index}`}
                        validate={mix(required, maxLength(15))}
                        type="text"
                        disabled={isContractSent}
                        highlight
                    />
                </div>
            );
        }
    }
    validatePutereAvizata = index => value => {
        const { formApi, session } = this.props;
        if (formApi) {
            const { values } = formApi.getState();
            let sessionPod = values[`loc_cod_pod-${index}`] || session?.ee_loc?.cod_pod || '';
            if (value) {
                if (!_.isNumber(+value)) {
                    return 'Campul Putere avizata trebuie sa contina cifre!';
                }
                if (+value < 1) {
                    return 'Campul Putere avizata trebuie sa contina cifre!';
                }
            } else if (
                sessionPod.startsWith('RO001E') ||
                sessionPod.startsWith('RO002E') ||
                sessionPod.startsWith('RO005E')
            ) {
                return 'Campul Putere avizata este necesar!';
            }
        }
    };

    greaterThanToday = index => value => {
        const today = moment();
        today.set({
            hour: 0,
            minute: 0,
            second: 0,
        });
        today.add(1, 'day');
        const date = moment(value, 'DD.MM.YYYY');

        date.set({
            hour: 0,
            minute: 0,
            second: 1,
        });

        const switchProduct =
            this.props.flow &&
            this.props.formApi.getValue(`are_furnizare_activa-${index}`) === true &&
            this.props.getProviderChange(index) === false &&
            this.props.formApi.getValue(`schimba_titular-${index}`) === false;

        if (date.isBefore(today) && switchProduct) {
            return 'Data minima azi + 1';
        }
    };

    validateSwitchSupplier = index => value => {
        const switchProduct =
            this.props.flow &&
            this.props.formApi.getValue(`are_furnizare_activa-${index}`) === true &&
            this.props.getProviderChange(index) === false &&
            this.props.formApi.getValue(`schimba_titular-${index}`) === false;

        const today = moment();
        today.set({
            hour: 0,
            minute: 0,
            second: 0,
        });
        today.add(6, 'day');
        const date = moment(value, 'DD.MM.YYYY');

        date.set({
            hour: 0,
            minute: 0,
            second: 1,
        });
        if (date.isBefore(today) && !switchProduct) {
            return 'Data minima azi + 6';
        }
    };

    renderAddress(address) {
        let value = address.county?.denumire || '';

        if (address.city) value += `, ${address.city}`;
        if (address.streetType && address.street)
            value += `, ${_.capitalize(address.streetType)} ${address.street}`;
        if (address.streetNo) value += `, Nr. ${address.streetNo}`;
        if (address.building) value += `, Bl. ${address.building}`;
        if (address.entrance) value += `, Sc. ${address.entrance}`;
        if (address.floor) value += `, Etaj ${address.floor}`;
        if (address.apartment) value += `, Ap ${address.apartment}`;

        return value;
    }

    renderUploadDocs(index) {
        const { isDocLoading, flow, shouldRenderPlaceDocs } = this.props;
        if (!flow) {
            return;
        }

        let { FACT_CLIENT, ACT_PROPRIETAR, ...docs } = this.state.docs[flow];
        const { docType } = this.state;

        return (
            <Fragment>
                <div className="pod-display-wrapper">
                    {index === 0 && (
                        <DocList
                            docs={{ ACT_PROPRIETAR }}
                            onDelete={(docIndex, imageIndex) =>
                                this.handleImageDelete(docIndex, imageIndex)
                            }
                            enableAdd
                            onAdd={(file, docType) => this.handleDocSelect(file, docType)}
                            //onPhoto={image => this.handlePhotoTake(image, 'ACT_PROPRIETAR', index)}
                            loading={isDocLoading(flow, 'ACT_PROPRIETAR')}
                            maxFileSize={megaBytesToBytes(10)}
                        />
                    )}
                    <DocList
                        docs={{ FACT_CLIENT }}
                        onDelete={(docIndex, imageIndex) =>
                            this.handleImageDelete(docIndex, imageIndex)
                        }
                        enableAdd
                        onAdd={(file, docType) => this.handleDocSelect(file, docType)}
                        //onPhoto={image => this.handlePhotoTake(image, 'FACT_CLIENT', index)}
                        loading={isDocLoading(flow, 'FACT_CLIENT')}
                        maxFileSize={megaBytesToBytes(10)}
                    />
                    <DocList
                        docs={docs}
                        onDelete={(docIndex, imageIndex) =>
                            this.handleImageDelete(docIndex, imageIndex)
                        }
                        enableAdd
                        onAdd={(file, docType) => this.handleDocSelect(file, docType)}
                        //onPhoto={image => this.handlePhotoTake(image, this.state.docType, index)}
                        loading={
                            !['FACT_CLIENT', 'ACT_PROPRIETAR', 'id'].includes(this.state.docType) &&
                            isDocLoading(flow, this.state.docType)
                        }
                        maxFileSize={megaBytesToBytes(10)}
                    />
                    {shouldRenderPlaceDocs && (
                        <CustomerDocsSelect
                            name="choice"
                            label="Documentele locului de consum"
                            placeholder="Alege"
                            value={
                                docType === 'ACT_PROPRIETAR' || docType === 'FACT_CLIENT'
                                    ? ''
                                    : docType
                            }
                            className="form-control place-docs"
                            containerClass="mb-3 col-md-12"
                            validations={[]}
                            onSelect={e => this.handleDocTypeSelect(e, index)}
                            items={this.getDocOptions(index)}
                            upperCase
                        />
                    )}
                </div>
            </Fragment>
        );
    }

    render() {
        const {
            isExpanded,
            isLinkSent,
            isContractSent,
            isActive,
            isPlaceStatement,
            onActiveChange,
            docs,
            docOptions,
            flow,
            nlc,
            index,
            counties,
            streetTypes,
            streets,
            cities,
            session,
            measurementIndexes,
            onCountyChange,
            onCityChange,
            onQuantityChange,
            formApi,
            onDocDelete,
        } = this.props;

        return (
            <Fragment>
                <div className={`PodBody row ${isExpanded ? 'expanded' : ''}`}>
                    <div className="col-md-6 col-left">
                        {this.renderGeneralData()}
                        <div className="group-name">ADRESA LOC DE CONSUM</div>
                        <div className="row">
                            <Select
                                className="col-md-6"
                                label="Județ"
                                name={`loc_judet-${index}`}
                                options={getCountyOptions(counties)}
                                onChange={e => onCountyChange(e, 'loc_', index)}
                                autocomplete
                                validate={requiredBefore(isLinkSent)}
                                disabled={this.isAddressDisabled() || isLinkSent}
                                highlight={!isLinkSent}
                            />
                            <Select
                                className="col-md-6"
                                label="Localitate"
                                name={`loc_localitate-${index}`}
                                options={getCityOptions(formApi, cities, 'loc_', `-${index}`)}
                                onChange={e => onCityChange(e, 'loc_', index)}
                                autocomplete
                                validate={requiredAfter(isLinkSent)}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                        </div>
                        <div className="row">
                            <Select
                                className="col-md-6"
                                label="Tip stradă"
                                name={`loc_tip_artera-${index}`}
                                options={getStreetTypeOptions(streetTypes)}
                                validate={requiredAfter(isLinkSent)}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                            <Select
                                className="col-md-6"
                                label="Stradă"
                                name={`loc_strada-${index}`}
                                options={getStreetOptions(
                                    formApi,
                                    cities,
                                    streets,
                                    'loc_',
                                    `-${index}`
                                )}
                                validate={requiredAfter(isLinkSent)}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                                autocomplete
                            />
                        </div>
                        <div className="row">
                            <Text
                                className="col-md-4"
                                label="Număr"
                                name={`loc_nr_strada-${index}`}
                                validate={mix(
                                    requiredAfter(isLinkSent),
                                    nlc.status === 'NOK' ? stringWithNumber : maxLength(15),
                                    maxLength(15)
                                )}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                            <Text
                                className="col-md-4"
                                label="Bloc"
                                name={`loc_bloc-${index}`}
                                validate={maxLength(10)}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                            <Text
                                className="col-md-4"
                                label="Scară"
                                name={`loc_scara-${index}`}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                        </div>
                        <div className="row">
                            <Text
                                className="col-md-4"
                                label="Etaj"
                                name={`loc_etaj-${index}`}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                            <Text
                                className="col-md-4"
                                label="Apartament"
                                name={`loc_apartament-${index}`}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                                validate={maxLength(15)}
                            />
                            <Text
                                className="col-md-4"
                                label="Cod poștal"
                                name={`loc_cod_postal-${index}`}
                                validate={mix(codPostal, integer)}
                                highlight={isLinkSent && !isContractSent}
                                disabled={this.isAddressDisabled() || isContractSent}
                            />
                        </div>
                        <div className="row">
                            <Text
                                className="col-md-4"
                                label="Index"
                                name={`loc_index-${index}`}
                                validate={integer}
                                disabled={this.props.nlc.index || isContractSent}
                                highlight={isLinkSent}
                                type="number"
                                onChange={this.handleIndexChange}
                            />
                            <Text
                                className="col-md-4"
                                label="Serie Contor"
                                name={`loc_serie_contor-${index}`}
                                disabled={isContractSent}
                                highlight={isLinkSent}
                            />
                            {this.renderIndexDate(index)}
                        </div>
                        <div className="group-name">DETALII LOC CONSUM</div>
                        <div className="row">
                            <Select
                                className="col-md-12"
                                label="Ai un contract de furnizare activ?"
                                name={`are_furnizare_activa-${index}`}
                                onChange={onActiveChange}
                                options={[
                                    {
                                        label: 'Da',
                                        value: true,
                                    },
                                    {
                                        label: 'Nu',
                                        value: false,
                                    },
                                ]}
                                validate={requiredBefore(isLinkSent)}
                                highlight={!isLinkSent}
                                disabled={isLinkSent || nlc.status === 'ACTIV'}
                            />
                        </div>
                        {this.renderProvider()}
                        <div className="row">
                            <Select
                                className="col-md-12"
                                label="Vrei să schimbi titularul contractului de furnizare?"
                                name={`schimba_titular-${index}`}
                                options={[
                                    {
                                        label: 'Da',
                                        value: true,
                                    },
                                    {
                                        label: 'Nu',
                                        value: false,
                                    },
                                ]}
                                validate={requiredBefore(isLinkSent)}
                                highlight={!isLinkSent}
                                disabled={isLinkSent || nlc.cnp_cui}
                                onChange={this.handleOwnerChange}
                            />
                        </div>
                        {this.renderPutereAvizata(index)}
                        {this.renderContractNumber(index)}
                        <div className="row">
                            <Text
                                className="col-md-6"
                                label="Dată start furnizare"
                                name={`furnizor_data_start-${index}`}
                                validate={mix(
                                    required,
                                    this.greaterThanToday(index),
                                    this.validateSwitchSupplier(index)
                                )}
                                type="date"
                                disabled={isContractSent}
                                highlight
                            />
                        </div>
                        {this.renderGasConsumer()}
                        {this.renderValidity(index)}
                        {this.renderPlaceStatement(flow)}
                        {this.props.contractType === 'b2b' && (
                            <Fragment>
                                <div className="group-name">Tip contract</div>
                                {/*<div className="row">*/}
                                {/*    <Select*/}
                                {/*        className="col-md-6"*/}
                                {/*        name={`data_start-${index}`}*/}
                                {/*        validate={required}*/}
                                {/*        options={[*/}
                                {/*            { value: 'Noncasnic', label: 'Noncasnic' },*/}
                                {/*            { value: 'Casnic', label: 'Casnic' },*/}
                                {/*        ]}*/}
                                {/*    />*/}
                                {/*</div>*/}
                                {/* <div className="group-name">Putere</div>
                                <div className="row">
                                    <Text
                                        className="col-md-6"
                                        label="Kw"
                                        name={`loc_putere-${index}`}
                                        validate={integer}
                                        highlight
                                    />
                                </div> */}
                            </Fragment>
                        )}
                        <Consumption
                            contractType={this.props.contractType}
                            isLinkSent={isLinkSent}
                            flow={flow}
                            nlc={nlc}
                            formApi={formApi}
                            index={index}
                            session={session}
                            measurementIndexes={measurementIndexes}
                            onQuantityChange={onQuantityChange}
                        />
                    </div>
                    <div className="col-md-6 col-right">
                        {this.canUploadDocs() && this.renderUploadDocs(index)}
                        {!this.canUploadDocs() && (
                            <Documents
                                flow={flow}
                                docs={docs[flow]}
                                options={docOptions}
                                onDelete={onDocDelete}
                            />
                        )}
                    </div>
                </div>
            </Fragment>
        );
    }

    renderPutereAvizata(index) {
        const { formApi, onPutereAvizataChange, session, getProviderChange, flow } = this.props;
        if (formApi) {
            const { values } = formApi.getState();
            // if (isActive && this.props.contractType === 'b2b') {

            let furnizareActiva =
                values[`are_furnizare_activa-${index}`] === undefined
                    ? session.ee_are_furnizare_activa
                    : values[`are_furnizare_activa-${index}`];
            const isSchimbaFurnizor = getProviderChange(index);

            if (
                ((furnizareActiva && isSchimbaFurnizor) || !furnizareActiva) &&
                this.props.contractType === 'b2b' &&
                flow === 'ee'
            ) {
                return (
                    <div className="row">
                        <Text
                            className="col-md-6"
                            label="Putere Avizata"
                            name={`putere_avizata-${index}`}
                            validate={this.validatePutereAvizata(index)}
                            onChange={onPutereAvizataChange}
                            highlight
                        />
                    </div>
                );
            }
            // }
        }
    }
}

const mapStateToProps = state => ({
    counties: getCounties(state),
    measurementIndexes: state.measurementIndexes,
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    client: getClient(state),
    streets: getStreets(state),
    distributors: getDistributors(state),
    session: getSession(state),
    eeProviders: getProviders(state, 'ee'),
    gazProviders: getProviders(state, 'gaz'),
    isLinkSent: isLinkSent(state),
    hasClientSignedAgreement: hasClientSignedAgreement(state),
    isContractSent: isContractSent(state),
    docs: getDocs(state),
    isPlanSelected: isPlanSelected(state),
    plan: getCurrentPlan(state),
    isDocLoading: isDocLoading(state),
    timestamps: getTimestamps(state),
    authUser: getAuthUser(state),
    isFastFlux: isFastFlux(state),
});

const mapDispatchToProps = {
    uploadID,
    unsetDocID,
    uploadInvoice,
    uploadOwnerDocs,
    deleteDoc,
    setDoc,
    setDocLoading,
    unsetDocLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(PodBody);

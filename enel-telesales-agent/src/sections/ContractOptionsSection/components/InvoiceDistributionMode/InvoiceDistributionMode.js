import React, { Fragment } from 'react';

import { Radio, Checkbox, FormErrors, Select, Text } from 'components/form';

import {
    getCityOptions,
    getCountyOptions,
    getStreetOptions,
    getStreetTypeOptions,
} from 'services/form';

import {
    codPostal,
    integer,
    maxLength,
    mix,
    requiredBefore,
    stringWithNumber,
} from 'services/rules';

const InvoiceDistributionMode = ({
    onCountyChange,
    onAddressChange,
    onCityChange,
    onEmailCheckbox,
    onEbillTypeSelected,
    isLinkSent,
    isPLMarketContract,
    formApi,
    addresses,
    counties,
    cities,
    streets,
    streetTypes,
    hasCFE,
    session,
    formErrors,
    ...props
}) => {
    return (
        <Fragment>
            <div className="group-name">MOD DISTRIBUIRE FACTURĂ</div>
            <div className="row">
                <Select
                    className="col-md-12"
                    label="Adresa de corespondență"
                    name="address"
                    options={addresses}
                    onChange={onAddressChange}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
            </div>
            <div className="row">
                <Select
                    className="col-md-6"
                    label="Județ"
                    name="factura_judet"
                    options={getCountyOptions(counties)}
                    onChange={onCountyChange}
                    validate={requiredBefore(isLinkSent)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                    autocomplete
                />
                <Select
                    className="col-md-6"
                    label="Localitate"
                    name="factura_localitate"
                    options={getCityOptions(formApi, cities, 'factura_')}
                    onChange={onCityChange}
                    validate={requiredBefore(isLinkSent)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                    autocomplete
                />
            </div>
            <div className="row">
                <Select
                    className="col-md-6"
                    label="Tip stradă"
                    name="factura_tip_artera"
                    options={getStreetTypeOptions(streetTypes)}
                    validate={requiredBefore(isLinkSent)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
                <Select
                    className="col-md-6"
                    label="Stradă"
                    name="factura_strada"
                    options={getStreetOptions(formApi, cities, streets, 'factura_')}
                    validate={requiredBefore(isLinkSent)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                    autocomplete
                />
            </div>
            <div className="row">
                <Text
                    className="col-md-4"
                    label="Număr"
                    name="factura_nr_strada"
                    validate={mix(requiredBefore(isLinkSent), stringWithNumber, maxLength(15))}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
                <Text
                    className="col-md-4"
                    label="Bloc"
                    name="factura_bloc"
                    validate={maxLength(10)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
                <Text
                    className="col-md-4"
                    label="Scară"
                    name="factura_scara"
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
            </div>
            <div className="row">
                <Text
                    className="col-md-4"
                    label="Etaj"
                    name="factura_etaj"
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
                <Text
                    className="col-md-4"
                    label="Apartament"
                    name="factura_apartament"
                    validate={maxLength(15)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
                <Text
                    className="col-md-4"
                    label="Cod poștal"
                    name="factura_cod_postal"
                    validate={mix(codPostal, integer)}
                    highlight={!isLinkSent}
                    disabled={isLinkSent || isPLMarketContract}
                />
            </div>
            <div className="row spaced-top">
                {session.contract_type === 'b2b' ? (
                    <Checkbox
                        className="col-md-12"
                        name="factura_mod_corespondenta"
                        label="Trimite factura pe e-mail"
                        onChange={onEmailCheckbox}
                        disabled={isLinkSent || hasCFE}
                    />
                ) : (
                    <Radio
                        className="col-md-12 contact-info-radio"
                        name="factura_mod_corespondenta1"
                        options={[
                            {
                                value: 'MAIL',
                                label: 'Trimite factura pe e-mail',
                            },
                            {
                                value: 'SMS',
                                label: 'Trimite factura pe SMS',
                            },
                        ]}
                        onChange={onEbillTypeSelected}
                        disabled={isLinkSent || hasCFE}
                    />
                )}
            </div>
            <div className="row">
                <div className="col-md-12">
                    <FormErrors errors={formErrors['invoice']} />
                </div>
            </div>
        </Fragment>
    );
};

export default InvoiceDistributionMode;

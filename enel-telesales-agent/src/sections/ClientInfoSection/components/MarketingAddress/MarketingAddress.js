import React, { Fragment } from 'react';
import _ from 'lodash';

import { Text, Select } from 'components/form';

import { mix, maxLength, codPostal, integer, requiredBefore } from 'services/rules';

import {
    getCountyOptions,
    getStreetTypeOptions,
    getCityOptions,
    getStreetOptions,
} from 'services/form';

const MarketingAddress = ({
    isLinkSent,
    formApi,
    counties,
    cities,
    streets,
    streetTypes,
    onCountyChange,
    onCityChange,
    options,
    ...props
}) => {
    const { postalChannel } = options;
    if (postalChannel) {
        return (
            <Fragment>
                <div className="row">
                    <Select
                        className="col-md-6"
                        label="Județ"
                        name="canal_posta_judet"
                        options={getCountyOptions(counties)}
                        onChange={e => onCountyChange(e, 'canal_posta_')}
                        validate={requiredBefore(isLinkSent)}
                        disabled={isLinkSent}
                        autocomplete
                    />
                    <Select
                        className="col-md-6"
                        label="Localitate"
                        name="canal_posta_localitate"
                        options={getCityOptions(formApi, cities, 'canal_posta_')}
                        onChange={e => onCityChange(e, 'canal_posta_')}
                        validate={requiredBefore(isLinkSent)}
                        disabled={isLinkSent}
                        autocomplete
                    />
                </div>
                <div className="row">
                    <Select
                        className="col-md-6"
                        label="Tip stradă"
                        name="canal_posta_tip_artera"
                        options={getStreetTypeOptions(streetTypes)}
                        validate={requiredBefore(isLinkSent)}
                        disabled={isLinkSent}
                    />
                    <Select
                        className="col-md-6"
                        label="Stradă"
                        name="canal_posta_strada"
                        options={getStreetOptions(formApi, cities, streets, 'canal_posta_')}
                        validate={requiredBefore(isLinkSent)}
                        disabled={isLinkSent}
                        autocomplete
                    />
                </div>
                <div className="row">
                    <Text
                        className="col-md-4"
                        label="Număr"
                        name="canal_posta_nr_strada"
                        validate={mix(requiredBefore(isLinkSent), maxLength(15))}
                        disabled={isLinkSent}
                    />
                    <Text
                        className="col-md-4"
                        label="Bloc"
                        name="canal_posta_bloc"
                        validate={maxLength(10)}
                        disabled={isLinkSent}
                    />
                    <Text
                        className="col-md-4"
                        label="Scară"
                        name="canal_posta_scara"
                        disabled={isLinkSent}
                    />
                </div>
                <div className="row">
                    <Text
                        className="col-md-4"
                        label="Etaj"
                        name="canal_posta_etaj"
                        disabled={isLinkSent}
                    />
                    <Text
                        className="col-md-4"
                        label="Apartament"
                        name="canal_posta_apartament"
                        validate={maxLength(15)}
                        disabled={isLinkSent}
                    />
                    <Text
                        className="col-md-4"
                        label="Cod poștal"
                        name="canal_posta_cod_postal"
                        validate={mix(codPostal, integer)}
                        disabled={isLinkSent}
                    />
                </div>
            </Fragment>
        );
    }

    return null;
};

export default MarketingAddress;

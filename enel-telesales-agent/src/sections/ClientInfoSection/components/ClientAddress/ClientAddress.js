import React, { Fragment } from 'react';

import { Select, Text } from 'components/form';

import {
    codPostal,
    integer,
    maxLength,
    mix,
    requiredAfter,
    stringWithNumber,
} from 'services/rules';

import {
    getCityOptions,
    getCountyOptions,
    getStreetOptions,
    getStreetTypeOptions,
} from 'services/form';

const ClientAddress = ({
    isLinkSent,
    isContractSent,
    formApi,
    counties,
    cities,
    streets,
    streetTypes,
    onCountyChange,
    onCityChange,
    contractType,
    ...props
}) => {
    return (
        <Fragment>
            <div className="group-name">
                {contractType === 'b2b' ? 'ADRESA SEDIU' : 'ADRESA DE DOMICILIU'}
            </div>
            <div className="row">
                {contractType === 'b2b' && (
                    <Fragment>
                        <Select
                            className="col-md-6"
                            label="Județ"
                            name={'company_address_judet'}
                            options={getCountyOptions(counties)}
                            onChange={e => onCountyChange(e, 'company_address_')}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                            autocomplete
                        />
                        <Select
                            className="col-md-6"
                            label="Localitate"
                            name={'company_address_localitate'}
                            options={getCityOptions(formApi, cities, 'company_address_')}
                            onChange={e => onCityChange(e, 'company_address_')}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                            autocomplete
                        />
                    </Fragment>
                )}
                {contractType === 'b2c' && (
                    <Fragment>
                        <Select
                            className="col-md-6"
                            label="Județ"
                            name={'client_judet'}
                            options={getCountyOptions(counties)}
                            onChange={e => onCountyChange(e, 'client_')}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                            autocomplete
                        />
                        <Select
                            className="col-md-6"
                            label="Localitate"
                            name={'client_localitate'}
                            options={getCityOptions(formApi, cities, 'client_')}
                            onChange={e => onCityChange(e, 'client_')}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                            autocomplete
                        />
                    </Fragment>
                )}
            </div>
            <div className="row">
                {contractType === 'b2b' && (
                    <Fragment>
                        <Select
                            className="col-md-6"
                            label="Tip stradă"
                            name={'company_address_tip_artera'}
                            options={getStreetTypeOptions(streetTypes)}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Select
                            className="col-md-6"
                            label="Stradă"
                            name={'company_address_strada'}
                            options={getStreetOptions(formApi, cities, streets, 'company_address_')}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                            autocomplete
                        />
                    </Fragment>
                )}
                {contractType === 'b2c' && (
                    <Fragment>
                        <Select
                            className="col-md-6"
                            label="Tip stradă"
                            name={'client_tip_artera'}
                            options={getStreetTypeOptions(streetTypes)}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Select
                            className="col-md-6"
                            label="Stradă"
                            name={'client_strada'}
                            options={getStreetOptions(formApi, cities, streets, 'client_')}
                            validate={requiredAfter(isLinkSent, true)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                            autocomplete
                        />
                    </Fragment>
                )}
            </div>
            <div className="row">
                {contractType === 'b2b' && (
                    <Fragment>
                        <Text
                            className="col-md-4"
                            label="Număr"
                            name={'company_address_nr_strada'}
                            validate={mix(
                                requiredAfter(isLinkSent, true),
                                stringWithNumber,
                                maxLength(15)
                            )}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Bloc"
                            name={'company_address_bloc'}
                            validate={maxLength(10)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Scară"
                            name={'company_address_scara'}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                    </Fragment>
                )}
                {contractType === 'b2c' && (
                    <Fragment>
                        <Text
                            className="col-md-4"
                            label="Număr"
                            name={'client_nr_strada'}
                            validate={mix(
                                requiredAfter(isLinkSent, true),
                                stringWithNumber,
                                maxLength(15)
                            )}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Bloc"
                            name={'client_bloc'}
                            validate={maxLength(10)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Scară"
                            name={'client_scara'}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                    </Fragment>
                )}
            </div>
            <div className="row">
                {contractType === 'b2b' && (
                    <Fragment>
                        <Text
                            className="col-md-4"
                            label="Etaj"
                            name={'company_address_etaj'}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Apartament"
                            name={'company_address_apartament'}
                            validate={maxLength(15)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Cod poștal"
                            name={'company_address_cod_postal'}
                            validate={mix(codPostal, integer)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                    </Fragment>
                )}
                {contractType === 'b2c' && (
                    <Fragment>
                        <Text
                            className="col-md-4"
                            label="Etaj"
                            name={'client_etaj'}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Apartament"
                            name={'client_apartament'}
                            validate={maxLength(15)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                        <Text
                            className="col-md-4"
                            label="Cod poștal"
                            name={'client_cod_postal'}
                            validate={mix(codPostal, integer)}
                            highlight={isLinkSent && !isContractSent}
                            disabled={isContractSent}
                        />
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
};

export default ClientAddress;

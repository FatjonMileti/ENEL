import React, { Fragment } from 'react';
import _ from 'lodash';

import { Select } from 'components/form';

import { requiredAfter } from 'services/rules';

import { getCountyOptions } from 'services/form';

const OfferCity = ({
    isLinkSent,
    isContractSent,
    formApi,
    counties,
    cities,
    streets,
    streetTypes,
    onCountyChange,
    onCityChange,
    ...props
}) => {
    return (
        <Fragment>
            <div className="row">
                <Select
                    className="col-md-12"
                    label="Județ"
                    name="client_judet"
                    options={getCountyOptions(counties)}
                    onChange={e => onCountyChange(e, 'client_')}
                    validate={requiredAfter(isLinkSent)}
                    highlight={isLinkSent && !isContractSent}
                    disabled={isContractSent}
                    autocomplete
                />
            </div>
        </Fragment>
    );
};

export default OfferCity;

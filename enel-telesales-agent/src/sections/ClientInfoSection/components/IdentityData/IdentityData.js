import React, { Fragment } from 'react';

import { Text } from 'components/form';

import {
    earlierThanToday,
    integer,
    maxLength,
    mix,
    requiredAfter,
    serieBuletin,
} from 'services/rules';

const IdentityData = ({ isLinkSent, isContractSent, isFastFlux, options, ...props }) => {
    return (
        <Fragment>
            <div className="group-name">DATE DE IDENTITATE</div>
            <div className="row">
                <Text
                    className="col-md-6"
                    label="Serie CI"
                    name="client_ci_serie"
                    validate={mix(!isFastFlux && requiredAfter(isLinkSent), serieBuletin)}
                    highlight={isLinkSent && !isContractSent}
                    disabled={isContractSent}
                />
                <Text
                    className="col-md-6"
                    label="Numar CI"
                    name="client_ci_numar"
                    validate={mix(!isFastFlux && requiredAfter(isLinkSent), maxLength(10), integer)}
                    highlight={isLinkSent && !isContractSent}
                    disabled={isContractSent}
                />
            </div>
            <div className="row">
                <Text
                    className="col-md-6"
                    label="Emis de"
                    name="client_ci_emis_de"
                    validate={mix(!isFastFlux && requiredAfter(isLinkSent), maxLength(64))}
                    highlight={isLinkSent && !isContractSent}
                    disabled={isContractSent}
                />
                <Text
                    className="col-md-6"
                    label="Emis la"
                    name="client_ci_emis_la"
                    validate={mix(!isFastFlux && requiredAfter(isLinkSent), earlierThanToday)}
                    highlight={isLinkSent && !isContractSent}
                    type="date"
                    disabled={isContractSent}
                />
            </div>
        </Fragment>
    );
};

export default IdentityData;

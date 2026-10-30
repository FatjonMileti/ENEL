import React, { Fragment } from 'react';
import _ from 'lodash';

import { Text, Select } from 'components/form';

import { mix, iban, requiredBefore } from 'services/rules';

const Bank = ({ show, banks, formApi, isLinkSent }) => {
    if (show) {
        return (
            <Fragment>
                <div className="row">
                    <Text
                        className="col-md-12"
                        label="IBAN"
                        name="factura_iban"
                        validate={mix(requiredBefore(isLinkSent), iban)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                    />
                </div>
                <div className="row">
                    <Select
                        className="col-md-12"
                        label="Banca"
                        name="factura_banca"
                        options={_.map(banks, bank => ({
                            value: bank.cod,
                            label: bank.denumire,
                        }))}
                        validate={requiredBefore(isLinkSent)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        autocomplete
                    />
                </div>
            </Fragment>
        );
    }
    return null;
};

export default Bank;

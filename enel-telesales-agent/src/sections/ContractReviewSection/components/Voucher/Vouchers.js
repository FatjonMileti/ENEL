/* eslint-disable linebreak-style */
import React, { Fragment } from 'react';
import _ from 'lodash';

import Voucher from './Voucher';

const Vouchers = ({ vouchers, getApi, readOnly }) => {
    if (!_.isEmpty(vouchers)) {
        let items = _.map(vouchers, (voucher, index) => {
            return (
                <Voucher
                    key={index}
                    getApi={getApi}
                    id={index}
                    voucher={voucher}
                    readOnly={readOnly}
                />
            );
        });

        return (
            <Fragment>
                <div className="group-name">Vouchere</div>
                {items}
            </Fragment>
        );
    }
    return null;
};

export default Vouchers;

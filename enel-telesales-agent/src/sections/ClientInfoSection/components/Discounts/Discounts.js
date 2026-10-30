/* eslint-disable linebreak-style */
import React, { Fragment } from 'react';
import _ from 'lodash';

import Discount from './Discount';

const Discounts = ({ discounts, sessionDiscountIds, readOnly }) => {
    if (!_.isEmpty(discounts)) {
        const itemsSize = _.size(discounts);
        let items = _.map(discounts, (discount, index) => {
            const isDiscountSelected =
                sessionDiscountIds.includes(discount.DiscountID) || itemsSize === 1;
            return (
                <Discount
                    key={discount.DiscountID}
                    discount={discount}
                    isSelected={isDiscountSelected}
                    readOnly={readOnly}
                />
            );
        });

        return (
            <Fragment>
                <div className="group-name">Discount-uri</div>
                {items}
            </Fragment>
        );
    }
    return null;
};

export default Discounts;

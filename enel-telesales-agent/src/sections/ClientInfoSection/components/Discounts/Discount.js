/* eslint-disable linebreak-style */
import React from 'react';

import { Checkbox } from 'components/form';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const HtmlTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

const Discount = ({ discount, isSelected, readOnly }) => {
    return (
        <HtmlTooltip
            title={
                <>
                    <div>Data de inceput: {discount.DiscountStartDate}</div>
                    <div>Data de sfarsit: {discount.DiscountEndDate}</div>
                    {!!discount.Description && <div>Detalii: {discount.Description}</div>}
                </>
            }
        >
            <div className="row">
                <Checkbox
                    className="col-md-12"
                    label={<span>{discount.DiscountName}</span>}
                    name={`discounts_${discount.DiscountID}`}
                    initialValue={isSelected}
                    disabled={readOnly}
                />
            </div>
        </HtmlTooltip>
    );
};

export default Discount;

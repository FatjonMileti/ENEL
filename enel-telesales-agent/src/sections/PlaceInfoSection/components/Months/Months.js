import React, { Fragment } from 'react';

import { localFormattedNumber, localFormattedNumberWithoutDecimal } from 'services/rules';

import { Text } from 'components/form';

import './Months.scss';

const monthNames = [
    'ianuarie',
    'februarie',
    'martie',
    'aprilie',
    'mai',
    'iunie',
    'iulie',
    'august',
    'septembrie',
    'octombrie',
    'noiembrie',
    'decembrie',
];

const Months = ({ showMonthly, index, formApi, flow }) => {
    const handleQuantityChange = (value, month) => {
        // let total = parseFloat(value.replace('.', '').replace(',', '.'));
        // monthNames.forEach(monthName => {
        //     if (month !== monthName) {
        //         total += parseFloat(
        //             formApi
        //                 .getValue(`${monthName}-${index}`)
        //                 .replace('.', '')
        //                 .replace(',', '.')
        //         );
        //     }
        // });
        // formApi.setValue(`loc_cantitate_anuala-${index}`, Math.round(total));
    };

    return (
        <Fragment>
            {flow && (
                <div
                    className={`Months row monthly-usage transition-3s-in-out ${showMonthly &&
                        'show'}`}
                >
                    <div className="col-md-12">
                        <div className="row">
                            <Text
                                label="Ianuarie"
                                className="col-md-4"
                                name={`ianuarie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'ianuarie')}
                            />
                            <Text
                                label="Februarie"
                                className="col-md-4"
                                name={`februarie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'februarie')}
                            />
                            <Text
                                label="Martie"
                                className="col-md-4"
                                name={`martie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'martie')}
                            />
                        </div>
                        <div className="row">
                            <Text
                                label="Aprilie"
                                className="col-md-4"
                                name={`aprilie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'aprilie')}
                            />
                            <Text
                                label="Mai"
                                className="col-md-4"
                                name={`mai-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'mai')}
                            />
                            <Text
                                label="Iunie"
                                className="col-md-4"
                                name={`iunie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'iunie')}
                            />
                        </div>
                        <div className="row">
                            <Text
                                label="Iulie"
                                className="col-md-4"
                                name={`iulie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'iulie')}
                            />
                            <Text
                                label="August"
                                className="col-md-4"
                                name={`august-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'august')}
                            />
                            <Text
                                label="Septembrie"
                                className="col-md-4"
                                name={`septembrie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'septembrie')}
                            />
                        </div>
                        <div className="row">
                            <Text
                                label="Octombrie"
                                className="col-md-4"
                                name={`octombrie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'octombrie')}
                            />
                            <Text
                                label="Noiembrie"
                                className="col-md-4"
                                name={`noiembrie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'noiembrie')}
                            />
                            <Text
                                label="Decembrie"
                                className="col-md-4"
                                name={`decembrie-${index}`}
                                validate={
                                    flow === 'gaz'
                                        ? localFormattedNumber
                                        : localFormattedNumberWithoutDecimal
                                }
                                type="text"
                                onChange={e => handleQuantityChange(e.target.value, 'decembrie')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default Months;

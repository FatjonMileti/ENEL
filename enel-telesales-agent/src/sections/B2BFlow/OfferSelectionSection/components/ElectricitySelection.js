import React, { useState } from 'react';
import { Select } from '../../../components/form';

const ElectricitySelection = props => {
    const [selectedElectricityInterval, setSelectedElectricityInterval] = useState('');

    const electricityIntervals = [
        { value: 'mai mic de 50.000 KWh/an', label: 'mai mic de 50.000 KWh/an' },
        {
            value: 'intre 50.000 KWh/an- 200.000KWh/an',
            label: 'intre 50.000 KWh/an- 200.000KWh/an',
        },
        {
            value: 'intre 200.000 KWh/an-1.000.000KWh/an',
            label: 'intre 200.000 KWh/an-1.000.000KWh/an',
        },
        {
            value: 'peste 1.000.000KWh/an',
            label: 'peste 1.000.000KWh/an',
            onClick: () =>
                (window.location =
                    'https://www.ppcenergy.ro/business'),
        },
    ];

    return (
        props.flow.type === 'ee' && (
            <Select
                className={'col-md-6'}
                options={electricityIntervals}
                onChange={e => setSelectedElectricityInterval(e.target.value)}
            />
        )
    );
};

export default ElectricitySelection;

import React, { useState } from 'react';
import { Select } from '../../../components/form';

const GazSelection = props => {
    const [selectedGasInterval, setSelectedGasInterval] = useState('');

    const gasIntervals = [
        { value: 'mai mic de 280.000 KWh/an', label: 'mai mic de 280.000 KWh/an' },
        {
            value: 'intre 280.000 KWh/an- 2.800.000KWh/an',
            label: 'intre 280.000 KWh/an- 2.800.000KWh/an',
        },
        {
            value: 'peste 2.800.000KWh/an',
            label: 'peste 2.800.000KWh/an',
            onClick: () =>
                (window.location =
                    'https://www.ppcenergy.ro/business'),
        },
    ];

    return (
        props.flow.type === 'gaz' && (
            <Select
                className={'col-md-6'}
                options={gasIntervals}
                onChange={e => setSelectedGasInterval(e.target.value)}
            />
        )
    );
};

export default GazSelection;

import React, { useState, Fragment } from 'react';
import { Radio, Select } from '../../../components/form';
import { FormControl, FormControlLabel, FormLabel, RadioGroup } from '@material-ui/core';
import ElectricitySelection from './components/ElectricitySelection';
import GazSelection from './components/GazSelection';

const OfferSelectionSection = props => {
    const [county, setCounty] = useState('');

    const counties = ['a', 'b', 'c']; // or maybe an external call to get values

    return (
        <Fragment>
            <Select
                className={'col-md-6'}
                options={counties}
                onChange={e => setCounty(e.target.value)}
            />
            <ElectricitySelection />
            <GazSelection />
            <FormControl component="fieldset">
                <FormLabel component="legend">
                    With what purpose is the energy ( electric / gas ) used?
                </FormLabel>
                <RadioGroup row aria-label="gender" name="row-radio-buttons-group">
                    <FormControlLabel value="casnic" control={<Radio />} label="Casnic" />
                    <FormControlLabel value="noncasnic" control={<Radio />} label="Noncasnic" />
                </RadioGroup>
            </FormControl>
        </Fragment>
    );
};

export default OfferSelectionSection;

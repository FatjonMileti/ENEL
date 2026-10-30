import 'date-fns';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';

import './TimePicker.scss';

interface Props {
    className: string;
    label?: string;
    type: string;
    defaultValue?: string;
    optionsTimeStep: any;
    handleSelectDate: (string) => void;
}

export const TimePicker = ({
    className,
    type,
    label,
    defaultValue,
    optionsTimeStep,
    handleSelectDate,
    ...props
}: Props) => {
    const handleTimeChange = date => {
        if (handleSelectDate) {
            handleSelectDate(date);
        }
    };

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container justify="space-around">
                <KeyboardTimePicker
                    className={className}
                    margin="normal"
                    id="time-picker"
                    label={label}
                    value={defaultValue}
                    onChange={handleTimeChange}
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                    }}
                />
            </Grid>
        </MuiPickersUtilsProvider>
    );
};

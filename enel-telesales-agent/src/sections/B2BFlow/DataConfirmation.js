import React, { Fragment } from 'react';
import { Typography } from '@material-ui/core';

const DataConfirmation = props => {
    return (
        <Fragment>
            <Typography>{props.cui}</Typography>
            <Typography>{props.cnp}</Typography>
        </Fragment>
    );
};

export default DataConfirmation;

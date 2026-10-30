import React, { useState, Fragment } from 'react';
import { Text } from '../../components/form';
import { Link, Typography } from '@material-ui/core';

const DataCollection = props => {
    const [companyName, setCompanyName] = useState('');
    // Authorized person data
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [mobilePhone, setMobilePhone] = useState('');
    const [email, setEmail] = useState('');

    const gdprNotification = 'The gdpr notification';

    return (
        <Fragment>
            <Typography>{gdprNotification}</Typography>
            <Link
                onClick={() => {
                    /*Download terms and conditions pdf*/
                }}
                aria-label={'Terms and Conditions'}
            />
            <Link
                onClick={() => {
                    /*Download general conditions pdf*/
                }}
                aria-label={'General Conditions for supply'}
            />
            <Text label={'Authorized Person Name'} onChange={e => setLastName(e.target.value)} />
            <Text
                label={'Authorized Person First Name'}
                onChange={e => setFirstName(e.target.value)}
            />
            <Text label={'Mobile Phone'} onChange={e => setMobilePhone(e.target.value)} />
            <Text label={'Email'} onChange={e => setEmail(e.target.value)} />
        </Fragment>
    );
};

export default DataCollection;

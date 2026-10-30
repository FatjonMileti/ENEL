import React, { useState, Fragment } from 'react';
import Section from '../../components/Section';
import { Select, Text } from '../../components/form';

const DataCompletion = props => {
    const [accountName, setAccountName] = useState('');
    const [vat, setVat] = useState('');
    const [telefon, setTelefon] = useState('');
    const [email, setEmail] = useState('');
    const [headquartersAddress, setHeadquartersAddress] = useState('');
    const [businessType, setBusinessType] = useState('');
    const businessTypes = [
        'PFA',
        'Real estate',
        'Family associations',
        'State institute',
        'NGO',
        'Commercial areas',
    ];
    // businessTypes will be an external call to sales force

    return (
        <Section>
            <Text label={'Account Name'} onChange={e => setAccountName(e.target.value)} />
            <Text label={'CUI'} onChange={e => setVat(e.target.value)} />
            <Text label={'Telefon'} onChange={e => setTelefon(e.target.value)}>
                Telefon
            </Text>
            <Text label={'Email'} onChange={e => setEmail(e.target.value)}>
                Email
            </Text>
            <Text label={'Referina NACE'} onChange={e => setAccountName(e.target.value)} />
            <Select options={businessTypes} onChange={e => setBusinessType(e.target.value)}>
                Tip societate{' '}
            </Select>
            <Text label={'Adresa sediu'} onChange={e => setHeadquartersAddress(e.target.value)} />
        </Section>
    );
};

export default DataCompletion;

import React, { Fragment, useEffect, useState } from 'react';
import { Text, FormErrors, FormSuccess, Select } from 'components/form';
import { Button } from 'components/Button';

import { mix, requiredBefore, cnp, required } from 'services/rules';
import api from '../../../../services/api';

const ClientIdentification = ({
    onValidateClick,
    formErrors,
    formSuccess,
    isLinkSent,
    isLoading,
    contractType,
}) => {
    const [roles, setRoles] = useState('');

    useEffect(() => {
        api.get('/legal-representative-role').then(response => setRoles(response.data));
    }, []);

    return (
        <Fragment>
            <div className="group-name">
                {contractType === 'b2b'
                    ? 'Indentificare reprezentant legal'
                    : 'IDENTIFICARE CLIENT'}
            </div>
            <FormSuccess message={formSuccess.match(/^CNP/g) ? formSuccess : ''} />
            <FormErrors errors={formErrors['cnp']} />
            <div className="row">
                {contractType === 'b2b' && (
                    <Text
                        className="col-md-8"
                        label="CNP"
                        name={'reprezentant_legal_cnp'}
                        validate={mix(required, cnp)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                    />
                )}
                {contractType === 'b2c' && (
                    <Text
                        className="col-md-8"
                        label="CNP"
                        name={'client_cnp'}
                        validate={mix(required, cnp)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                    />
                )}
                <div className="col-md-4">
                    <Button
                        secondary
                        fullWidth
                        value="Valideaza"
                        disabled={isLinkSent || isLoading}
                        onClick={() => onValidateClick('cnp')}
                    />
                </div>
            </div>
            <div className="row">
                {contractType === 'b2b' && (
                    <Text
                        className="col-md-6"
                        label="Prenume"
                        name="reprezentant_legal_prenume"
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        upperCase
                    />
                )}
                {contractType === 'b2c' && (
                    <Text
                        className="col-md-6"
                        label="Prenume"
                        name="client_prenume"
                        validate={requiredBefore(isLinkSent)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        upperCase
                    />
                )}
                {contractType === 'b2b' && (
                    <Text
                        className="col-md-6"
                        label="Nume"
                        name={'reprezentant_legal_nume'}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        upperCase
                    />
                )}
                {contractType === 'b2c' && (
                    <Text
                        className="col-md-6"
                        label="Nume"
                        name={'client_nume'}
                        validate={requiredBefore(isLinkSent)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        upperCase
                    />
                )}
            </div>
            {contractType === 'b2b' && (
                <div className="row">
                    <Select
                        className="col-md-4"
                        label={'Rol reprezentat'}
                        options={roles}
                        validate={required}
                        name="reprezentant_legal_rol"
                    />
                </div>
            )}
        </Fragment>
    );
};

export default ClientIdentification;

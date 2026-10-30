import React, { Fragment } from 'react';

import { FormErrors, Text } from 'components/form';

import { email, tel, telFix } from 'services/rules';

const ContactData = ({ isLinkSent, formErrors, contractType, ...props }) => {
    return (
        <Fragment>
            <div className="group-name">DATE DE CONTACT</div>
            <FormErrors errors={formErrors['contact']} />
            <FormErrors errors={formErrors['email']} />
            <div className="row">
                {contractType === 'b2b' && (
                    <Text
                        className="col-md-6"
                        label="Telefon mobil"
                        name="reprezentant_legal_telefon_mobil"
                        // highlight={!isLinkSent}
                        // disabled={isLinkSent}
                        validate={tel}
                    />
                )}
                {contractType === 'b2c' && (
                    <Text
                        className="col-md-6"
                        label="Telefon mobil"
                        name="client_telefon_mobil"
                        validate={tel}
                        // highlight={!isLinkSent}
                        // disabled={isLinkSent}
                    />
                )}
                {contractType === 'b2b' && (
                    <Text
                        className="col-md-6"
                        label="E-mail"
                        name="reprezentant_legal_email"
                        // highlight={!isLinkSent}
                        // disabled={isLinkSent}
                        validate={email}
                    />
                )}
                {contractType === 'b2c' && (
                    <Text
                        className="col-md-6"
                        label="E-mail"
                        name="client_email"
                        validate={email}
                        // highlight={!isLinkSent}
                        // disabled={isLinkSent}
                    />
                )}
            </div>
            {contractType === 'b2c' && (
                <div className="row">
                    <Text
                        className="col-md-6"
                        label="Telefon mobil alternativ"
                        name="client_telefon_mobil_alternativ"
                        validate={tel}
                        // highlight={!isLinkSent}
                        // disabled={isLinkSent}
                    />
                    <Text
                        className="col-md-6"
                        label="Telefon fix"
                        name="client_telefon_fix"
                        validate={telFix}
                        // highlight={!isLinkSent}
                        // disabled={isLinkSent}
                    />
                </div>
            )}
        </Fragment>
    );
};

export default ContactData;

import React, { Fragment } from 'react';

import { Checkbox, Text } from 'components/form';

import { email, tel } from 'services/rules';

const MarketingOptions = ({ options, onChannelCheckbox, onAddressCheckbox }) => {
    const { agreementMk, agreementPart, emailChannel, smsChannel, phoneChannel } = options;
    if (agreementMk || agreementPart) {
        return (
            <Fragment>
                <div className="row">
                    <Checkbox
                        className="col-md-12"
                        name="contact_canal_email"
                        label="Comunicare prin e-mail"
                        onChange={e => onChannelCheckbox(e, 'client_email')}
                        disabled
                        black
                    />
                </div>
                {emailChannel && (
                    <div className="row">
                        <Text
                            className="col-md-12 linked-input"
                            label="E-mail"
                            name="contact_canal_email_text"
                            validate={email}
                            disabled={!emailChannel}
                            display
                        />
                    </div>
                )}
                <div className="row">
                    <Checkbox
                        className="col-md-12"
                        name="contact_canal_sms"
                        label="Comunicare prin SMS"
                        onChange={e =>
                            onChannelCheckbox(e, 'client_telefon_mobil', 'client_telefon_fix')
                        }
                        disabled
                        black
                    />
                </div>
                {smsChannel && (
                    <div className="row">
                        <Text
                            className="col-md-12 linked-input"
                            label="Telefon"
                            name="contact_canal_sms_text"
                            validate={tel}
                            disabled={!smsChannel}
                            display
                        />
                    </div>
                )}
                <div className="row">
                    <Checkbox
                        className="col-md-12"
                        name="contact_canal_telefon"
                        label="Comunicare prin telefon"
                        onChange={e =>
                            onChannelCheckbox(e, 'client_telefon_mobil', 'client_telefon_fix')
                        }
                        disabled
                        black
                    />
                </div>
                {phoneChannel && (
                    <div className="row">
                        <Text
                            className="col-md-12 linked-input"
                            label="Telefon"
                            name="contact_canal_telefon_text"
                            validate={tel}
                            disabled={!phoneChannel}
                            display
                        />
                    </div>
                )}
                <div className="row">
                    <Checkbox
                        className="col-md-12"
                        name="contact_canal_posta"
                        label="Comunicare prin posta"
                        onChange={onAddressCheckbox}
                        disabled
                        black
                    />
                </div>
            </Fragment>
        );
    }
    return null;
};

export default MarketingOptions;

import React, { Fragment } from 'react';

import { Text, Checkbox } from 'components/form';
import CheckboxControlled from 'components/form/CheckboxControlled';

import { email } from 'services/rules';

const MarketingOptions = ({
    isLinkSent,
    options,
    onChannelCheckbox,
    onAddressCheckbox,
    atLeastOneMarketingChannelAccepted,
}) => {
    const { emailChannel, smsChannel, phoneChannel } = options;
    return (
        <Fragment>
            <div className="row">
                <CheckboxControlled
                    className="col-md-12"
                    name="contact_canal_email"
                    label="Comunicare prin e-mail"
                    checked={emailChannel}
                    onChange={onChannelCheckbox}
                    disabled={!atLeastOneMarketingChannelAccepted}
                />
            </div>
            <div className="row">
                <Text
                    className="col-md-12 linked-input"
                    label="E-mail"
                    name="contact_canal_email_text"
                    validate={email}
                    // onChange={}
                    disabled={emailChannel === false}
                />
            </div>
            <div className="row">
                <CheckboxControlled
                    className="col-md-12"
                    name="contact_canal_sms"
                    label="Comunicare prin SMS"
                    onChange={onChannelCheckbox}
                    checked={smsChannel}
                    disabled={!atLeastOneMarketingChannelAccepted}
                />
            </div>
            <div className="row">
                <Text
                    className="col-md-12 linked-input"
                    label="Telefon"
                    name="contact_canal_sms_text"
                    disabled={smsChannel === false}
                />
            </div>
            <div className="row">
                <CheckboxControlled
                    className="col-md-12"
                    name="contact_canal_telefon"
                    label="Comunicare prin telefon"
                    onChange={onChannelCheckbox}
                    checked={phoneChannel}
                    disabled={!atLeastOneMarketingChannelAccepted}
                />
            </div>
            <div className="row">
                <Text
                    className="col-md-12 linked-input"
                    label="Telefon"
                    name="contact_canal_telefon_text"
                    disabled={phoneChannel === false}
                />
            </div>
            <div className="row">
                <Checkbox
                    className="col-md-12"
                    name="contact_canal_posta"
                    label="Comunicare prin posta"
                    onChange={onAddressCheckbox}
                    disabled={!atLeastOneMarketingChannelAccepted}
                />
            </div>
        </Fragment>
    );
};

export default MarketingOptions;

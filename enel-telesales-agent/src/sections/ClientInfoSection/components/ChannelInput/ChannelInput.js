import React from 'react';
import _ from 'lodash';

import Text from 'components/form/Text';

import { mix, requiredBefore, email, tel } from 'services/rules';

const ChannelInput = ({ isLinkSent, options, ...props }) => {
    const { emailChannel, phoneChannel } = options;
    if (emailChannel) {
        return (
            <Text
                className="col-md-8 linked-input"
                label="E-mail"
                name="contact_email"
                validate={mix(requiredBefore(isLinkSent))}
                highlight={!isLinkSent}
                disabled={isLinkSent}
            />
        );
    } else if (phoneChannel) {
        return (
            <Text
                className="col-md-8 linked-input"
                label="Telefon"
                name="contact_telefon"
                validate={mix(requiredBefore(isLinkSent))}
                highlight={!isLinkSent}
                disabled={isLinkSent}
            />
        );
    }
    return null;
};

export default ChannelInput;

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import Section from 'components/Section';
import Signature from 'components/Signature';

import './SignatureSection.scss';

class SignatureSection extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
    render() {
        return (
            <Section className="SignatureSection">
                <div className="section-title">Semnați în acest chenar</div>
                <Signature />
            </Section>
        );
    }
}

export default SignatureSection;

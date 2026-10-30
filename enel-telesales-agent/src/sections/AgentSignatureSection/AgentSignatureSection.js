import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import Section from 'components/Section';
import Signature from 'components/Signature';

import './AgentSignatureSection.scss';

class AgentSignatureSection extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    async handleSaveClick(e) {
        this.props.onNextClick();
    }

    render() {
        return (
            <Section
                title="Semnatura Agent"
                step={this.props.step}
                isCurrent={this.props.isCurrent}
                show={this.props.show}
                className="AgentSignatureSection"
            >
                <Signature onSaveClick={this.handleSaveClick} />
            </Section>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AgentSignatureSection);

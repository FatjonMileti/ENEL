import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import _ from 'lodash';
import { getItem as getVoucher } from 'store/voucher/selectors';
import { getSession, hasDocsCompleted, isContractSent } from 'store/session/selectors';
import { getLink } from 'store/client/selectors';
import Vouchers from './components/Voucher/Vouchers';
import Section from 'components/Section';
import { Form, FormErrors } from 'components/form';
import { Button } from 'components/Button';
import Loader from 'components/Loader';
import sessionService from 'services/session';

import './ContractReviewSection.scss';

class ContractReviewSection extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    getGeneratedDocsURL(flow) {
        const { session } = this.props;
        return `${process.env.REACT_APP_API_URL}/landing/${session.hash}/${
            session.id
        }/Documente.zip?type=${flow.toUpperCase()}`;
    }

    hasGeneratedDocs(flow) {
        const { session } = this.props;
        return (
            session[`${flow}_sign_success`] && !_.isEmpty(session[`${flow}_generated_documents`])
        );
    }

    renderGenerateStatus() {
        const { generateStatus } = this.props;
        return (
            generateStatus.step &&
            generateStatus.flow && (
                <p className="status">
                    Se {generateStatus.step === 'CREATE' ? 'creeaza' : 'semneaza'} documentele
                    pentru {generateStatus.flow === 'ee' ? 'electricitate' : 'gaze naturale'}.
                </p>
            )
        );
    }

    renderButtons() {
        const {
            link,
            onSendClick,
            onIncompleteDocsClick,
            onGenerateClick,
            onRejectClick,
            session,
        } = this.props;

        if (_.isBoolean(session.ee_agree) || _.isBoolean(session.gaz_agree)) return null;

        const showReject =
            session.ee_agree == null && session.gaz_agree == null && session.id && session.type;

        if (session.is_fast_flow) {
            return (
                <div className="spaced-top">
                    {(session.status === 'NEW' || session.status === 'OFFER') && (
                        <Button primary value="Generează Contract" onClick={onGenerateClick} />
                    )}
                    {/*{session.status !== 'NEW' && (*/}
                    {/*    <Button*/}
                    {/*        primary*/}
                    {/*        value="Trimitere/retransmitere link"*/}
                    {/*        onClick={onSendClick}*/}
                    {/*    />*/}
                    {/*)}*/}
                    {session.status === 'OFFER_ERR' && (
                        <Button
                            primary
                            underline
                            value="Generează Contract"
                            onClick={onGenerateClick}
                        />
                    )}
                    {showReject && (
                        <Button primary underline value="Refuză Contract" onClick={onRejectClick} />
                    )}
                </div>
            );
        }

        if (session.status === 'NEW' || session.status === 'OFFER') {
            if (session.client_upload_agree_date) {
                return (
                    <div className="spaced-top">
                        <Button primary value="Generează Contract" onClick={onGenerateClick} />
                        <Button
                            primary
                            underline
                            value="Trimitere/retransmitere link"
                            onClick={onSendClick}
                        />
                        {showReject && (
                            <Button
                                primary
                                underline
                                value="Refuză Contract"
                                onClick={onRejectClick}
                            />
                        )}
                    </div>
                );
            }

            if (session.client_upload_agree_date == null && (session.link_sent_date || link)) {
                return (
                    <div className="spaced-top">
                        <Button
                            primary
                            value="Trimitere/retransmitere link"
                            onClick={onSendClick}
                        />
                        <Button
                            primary
                            underline
                            value="Reminder e-mail/sms documente incomplete"
                            onClick={onIncompleteDocsClick}
                        />
                        {showReject && (
                            <Button
                                primary
                                underline
                                value="Refuză Contract"
                                onClick={onRejectClick}
                            />
                        )}
                    </div>
                );
            }

            if (session.client_upload_agree_date == null && session.link_sent_date == null) {
                return (
                    <div className="spaced-top">
                        <Button
                            primary
                            value="Trimitere/retransmitere link"
                            onClick={onSendClick}
                        />
                        {showReject && (
                            <Button
                                primary
                                underline
                                value="Refuză Contract"
                                onClick={onRejectClick}
                            />
                        )}
                    </div>
                );
            }
        }

        return (
            <div className="spaced-top">
                <Button primary value="Trimitere/retransmitere link" onClick={onSendClick} />
                {session.status === 'OFFER_ERR' && (
                    <Button
                        primary
                        underline
                        value="Generează Contract"
                        onClick={onGenerateClick}
                    />
                )}
                {showReject && (
                    <Button primary underline value="Refuză Contract" onClick={onRejectClick} />
                )}
            </div>
        );
    }

    renderSessionStatus() {
        const { session } = this.props;
        return <div className="session-status">{sessionService.getStatus(session)}</div>;
    }

    renderStatusDetails() {
        const { session } = this.props;
        if (session.abandon_type) {
            return <div className="session-status-details">"{session.abandon_details}"</div>;
        }
    }

    renderOpenLink() {
        const { link } = this.props;
        if (
            link &&
            (process.env.REACT_APP_ENV === 'development' || process.env.REACT_APP_ENV === 'staging')
        ) {
            return (
                <a href={link} target="_blank" rel="noopener noreferrer">
                    Deschide link.
                </a>
            );
        }
    }

    renderContent() {
        const { isLoading, error } = this.props;
        if (isLoading) {
            return (
                <Fragment>
                    {this.renderGenerateStatus()}
                    <Loader show />
                </Fragment>
            );
        }

        return (
            <Fragment>
                {this.renderSessionStatus()}
                {this.renderStatusDetails()}
                {this.renderOpenLink()}
                <FormErrors errors={error ? [error] : []} />
                {this.renderButtons()}
            </Fragment>
        );
    }

    render() {
        const { step, isCurrent, show, getApi = f => f } = this.props;
        return (
            <div>
                <Section
                    className="ContractReviewSection"
                    step={step}
                    isCurrent={isCurrent}
                    show={show}
                >
                    <Form autoComplete="off" getApi={this.setFormApi}>
                        <Vouchers getApi={getApi} vouchers={['']} />
                    </Form>

                    <Section
                        title="Status Contract"
                        className="ContractReviewSection"
                        step={step}
                        isCurrent={isCurrent}
                        show={show}
                    >
                        {this.renderContent()}
                    </Section>
                </Section>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    session: getSession(state),
    link: getLink(state),
    isContractSent: isContractSent(state),
    hasDocsCompleted: hasDocsCompleted(state),
    voucher: getVoucher(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ContractReviewSection);

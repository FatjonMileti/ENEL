import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './AllocateModal.scss';
import { Checkbox, Form, FormErrors, FormSuccess, Select, Text } from 'components/form';

import { totalSelected, totalUpdated } from 'store/leads/selectors';
import { unsetTotalUpdated } from 'store/leads/actions';

class AllocateModal extends Component {
    state = {
        showLimitInput: false,
        totalSelected: 0,
        isAllocated: false,
        isLoading: false,
    };

    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
    }

    getTotalFailed() {
        const { totalUpdated } = this.props;
        return this.getTotalSelected() - (totalUpdated || 0);
    }

    getTotalSelected() {
        const { totalSelected } = this.state;
        const limit = this.formApi.getValue('limit');
        if (limit) {
            return Math.min(totalSelected || 0, limit || 0);
        }
        return totalSelected;
    }

    toggleLimitInput(e) {
        this.setState({ showLimitInput: e.target.checked });
    }

    handleShow() {
        const { onShow, unsetTotalUpdated, totalSelected } = this.props;
        unsetTotalUpdated();
        disableBodyScroll(this.modal.current);
        this.setState({ isAllocated: false, totalSelected });
        if (onShow) {
            onShow();
        }
    }

    handleHide() {
        const { onHide, unsetTotalUpdated } = this.props;
        unsetTotalUpdated();
        enableBodyScroll(this.modal.current);
        this.setState({ isAllocated: false, totalSelected: 0 });
        if (onHide) {
            onHide();
        }
    }

    async handleConfirmClick(e) {
        e.preventDefault();
        const agentId = this.formApi.getValue('agent');
        const limit = this.formApi.getValue('limit');
        this.setState({ isLoading: true });

        if (this.props.onConfirm) {
            try {
                await this.props.onConfirm(
                    e,
                    agentId,
                    this.state.showLimitInput && limit ? limit : null
                );
                this.setState({ isLoading: false, isAllocated: true });
            } catch (error) {
                this.setState({ isLoading: false, isAllocated: true });
            }
        }
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    renderForm(label) {
        const { totalUpdated } = this.props;
        const { isAllocated } = this.state;

        return (
            <Form autoComplete="off" getApi={this.setFormApi}>
                {isAllocated && totalUpdated > 1 && (
                    <FormSuccess message={`Au fost alocate ${totalUpdated} leaduri.`} />
                )}
                {isAllocated && totalUpdated === 1 && (
                    <FormSuccess message="A fost alocat un lead cu succes." />
                )}
                {isAllocated && this.getTotalFailed() > 1 && (
                    <FormErrors errors={[`Alocarea a ${this.getTotalFailed()} leaduri a esuat.`]} />
                )}
                {isAllocated && this.getTotalFailed() === 1 && (
                    <FormErrors errors={['Alocarea unui lead a esuat.']} />
                )}
                {!isAllocated && (
                    <Fragment>
                        <div className="row">
                            <Select
                                className="offset-md-3 col-md-6"
                                label={label}
                                name="agent"
                                options={this.props.agents}
                                highlight
                                autocomplete
                            />
                        </div>
                        <div className="row limit-input-wrapper">
                            <Checkbox
                                className="offset-md-3 col-md-1 checkbox"
                                onClick={this.toggleLimitInput}
                                checked={this.state.showLimitInput}
                            />
                            <Text
                                className="col-md-5 text-input"
                                label="Doar primii"
                                name="limit"
                                type="number"
                                disabled={!this.state.showLimitInput}
                            />
                        </div>
                    </Fragment>
                )}
            </Form>
        );
    }

    renderButtons() {
        const { isAllocated, isLoading } = this.state;
        if (isAllocated) {
            return <Button primary value="OK" onClick={this.hide} />;
        }
        return (
            <Fragment>
                <Button
                    primary
                    value="Alocā"
                    disabled={isLoading}
                    onClick={this.handleConfirmClick}
                />
                <Button
                    primary
                    underline
                    value="Anuleazā"
                    onClick={this.handleDismissClick}
                    disabled={isLoading}
                />
            </Fragment>
        );
    }

    render() {
        return (
            <DropModal
                className="AllocateModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">{this.props.title}</div>
                    <div className="data-panel">{this.renderForm(this.props.dataLabel)}</div>
                    {this.renderButtons()}
                </div>
            </DropModal>
        );
    }
}

const mapStateToProps = state => ({
    totalUpdated: totalUpdated(state),
    totalSelected: totalSelected(state),
});

const mapDispatchToProps = {
    unsetTotalUpdated,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(AllocateModal);

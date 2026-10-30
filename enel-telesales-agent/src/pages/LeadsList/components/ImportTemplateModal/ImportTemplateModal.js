import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';
import TemplateDetails from './components/TemplateDetails';

import './ImportTemplateModal.scss';
import { Form, Text, Select } from 'components/form';
import ConfirmModal from 'components/modals/ConfirmModal';

const initialState = {
    formApi: null,
    name: '',
    templateId: null,
    template: {},
    createTemplate: null,
    isTemplateSelected: false,
};

class ImportTemplateModal extends Component {
    modal = React.createRef();
    templateDeleteModal = React.createRef();

    state = initialState;

    constructor(props) {
        super(props);
        autoBind(this);
    }

    setFormApi(formApi) {
        this.setState({ formApi });
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
    }

    getTemplateOptions() {
        const { templates } = this.props;
        return _.map(templates, (item, index) => ({
            value: item.id,
            label: item.name,
        }));
    }

    handleShow() {
        const { onShow } = this.props;
        disableBodyScroll(this.modal.current);
        if (onShow) {
            onShow();
        }
    }

    handleHide() {
        const { onHide } = this.props;
        enableBodyScroll(this.modal.current);
        if (onHide) {
            onHide();
        }
        this.setState(initialState);
    }

    handleConfirmClick(e) {
        e.preventDefault();
        const { template, name, templateId } = this.state;
        this.hide();
        if (this.props.onConfirm) {
            this.props.onConfirm(template, name, templateId);
        }
    }

    handleDismissClick(e) {
        e.preventDefault();

        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    handleAddOption(key, value) {
        this.setState({
            template: {
                ...this.state.template,
                [key]: value,
            },
        });
    }

    handleRemoveOption(key) {
        const template = { ...this.state.template };
        delete template[key];
        this.setState({ template });
    }

    handleCreateTemplate() {
        this.setState({ createTemplate: true });
    }

    handleDeleteTemplate() {
        this.templateDeleteModal.current.show();
    }

    handleTemplateDeleteConfirm() {
        this.state.formApi.setValue('leadTemplate', '');
        this.setState({
            template: {},
            templateId: null,
            isTemplateSelected: false,
        });
        this.props.onTemplateDelete(this.state.templateId);
    }

    handleTemplateSelection(e) {
        const { templates } = this.props;
        const id = e.target.value;
        const template = templates.find(item => item.id === id);
        if (template) {
            this.setState({
                name: null,
                template: template.template,
                templateId: template.id,
                isTemplateSelected: true,
            });
        }
    }

    handleSetTemplateName(e) {
        const name = e.target.value;
        this.setState({ name });
    }

    renderConfirmButton() {
        if (this.props.confirmLabel) {
            return (
                <Button
                    primary
                    value={this.props.confirmLabel}
                    onClick={this.handleConfirmClick}
                    disabled={this.state.createTemplate ? !this.state.name : false}
                />
            );
        }
    }

    renderDismissButton() {
        if (this.props.dismissLabel) {
            return (
                <Button
                    primary
                    underline
                    value={this.props.dismissLabel}
                    onClick={this.handleDismissClick}
                />
            );
        }
    }

    render() {
        const { createTemplate, isTemplateSelected } = this.state;
        return (
            <Fragment>
                <ConfirmModal
                    title="Ești sigur că vrei să ștergi acest template?"
                    confirmLabel="Șterge"
                    dismissLabel="Anuleazā"
                    ref={this.templateDeleteModal}
                    className="z-index-2000"
                    onConfirm={this.handleTemplateDeleteConfirm}
                />
                <DropModal
                    className="ImportTemplateModal"
                    ref={this.modal}
                    onShow={this.handleShow}
                    onHide={this.handleHide}
                >
                    <div className="modal-overlay">
                        <div className="title">Template Import</div>
                        <div className="data-panel">
                            <Form autoComplete="off" getApi={this.setFormApi}>
                                <div className="row choose-template">
                                    <Fragment>
                                        {!createTemplate && (
                                            <Select
                                                className="col-md-6"
                                                label="Alege Template"
                                                name="leadTemplate"
                                                options={this.getTemplateOptions()}
                                                onChange={this.handleTemplateSelection}
                                            />
                                        )}
                                        {!createTemplate && !isTemplateSelected && (
                                            <div className="col-md-6">
                                                <Button
                                                    secondary
                                                    value="Creaza Template"
                                                    onClick={this.handleCreateTemplate}
                                                />
                                            </div>
                                        )}
                                        {isTemplateSelected && (
                                            <div className="col-md-6">
                                                <Button
                                                    secondary
                                                    outline
                                                    value="Sterge"
                                                    className="right"
                                                    onClick={this.handleDeleteTemplate}
                                                />
                                            </div>
                                        )}
                                    </Fragment>
                                    {createTemplate && (
                                        <Text
                                            className="col-md-6"
                                            label="Denumire Template"
                                            name="template_name"
                                            onChange={e => this.handleSetTemplateName(e)}
                                        />
                                    )}
                                </div>
                                <TemplateDetails
                                    template={this.state.template}
                                    onAdd={this.handleAddOption}
                                    onRemove={this.handleRemoveOption}
                                    formApi={this.state.formApi}
                                    displayAddOption={
                                        this.state.createTemplate || this.state.isTemplateSelected
                                    }
                                />
                            </Form>
                        </div>
                        {this.renderConfirmButton()}
                        {this.renderDismissButton()}
                    </div>
                </DropModal>
            </Fragment>
        );
    }
}

export default ImportTemplateModal;

import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import Loader from 'components/Loader';
import { Button } from 'components/Button';
import { FormFailure, FormStatus, FormSuccess } from 'components/form';

import './ImportStatusModal.scss';

class ImportStatusModal extends Component {
    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    getTitle() {
        const { imported, total } = this.props;
        return `Se importa ${imported}/${total} lead-uri`;
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
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
    }

    renderLoader() {
        let { imported, total } = this.props;
        if (imported < total) {
            return <Loader show />;
        }
    }

    renderStatus() {
        let { imported, successful, updated, errored, total } = this.props;
        successful = successful ? successful : 0;
        errored = errored ? errored : 0;
        if (imported > 0 && imported === total) {
            return (
                <Fragment>
                    {!!successful && (
                        <FormSuccess message={`${successful} leaduri importate cu succes.`} />
                    )}
                    {!!updated && (
                        <FormStatus message={`${updated} leaduri actualizate cu succes.`} />
                    )}
                    {!!errored && (
                        <FormFailure message={`${errored} leaduri cu eroare la import.`} />
                    )}
                </Fragment>
            );
        }
    }

    renderButton() {
        let { imported, total } = this.props;
        if (imported > 0 && imported === total) {
            return <Button primary value="OK" onClick={this.hide} />;
        }
    }

    render() {
        return (
            <DropModal
                className="ImportStatusModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">{this.getTitle()}</div>
                    <div className="data-panel">
                        {this.renderLoader()}
                        {this.renderStatus()}
                    </div>
                    {this.renderButton()}
                </div>
            </DropModal>
        );
    }
}

export default ImportStatusModal;

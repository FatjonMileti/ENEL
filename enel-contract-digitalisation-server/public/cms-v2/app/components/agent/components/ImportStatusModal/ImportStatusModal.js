import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';
import Loader from '../../../../../blocks/Loader';
import FormSuccess  from '../../../../../blocks/form/FormSuccess';
import FormFailure from '../../../../../blocks/form/FormFailure';

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
        return `Se importa ${imported}/${total} officers`;
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
    }

    handleShow() {
        const { onShow } = this.props;
        if (onShow) {
            onShow();
        }
    }

    handleHide() {
        const { onHide } = this.props;
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
        let { imported, successful, errored, total } = this.props;
        successful = successful ? successful : 0;
        errored = errored ? errored : 0;
        if (imported > 0 && imported == total) {
            return (
                <Fragment>
                    {!!successful && (
                        <FormSuccess message={`Successfully imported ${successful} officers.`} />
                    )}
                    {!!errored && (
                        <FormFailure message={`${errored} officers failed to import.`} />
                    )}
                </Fragment>
            );
        }
    }

    renderButton() {
        let { imported, total } = this.props;
        if (imported > 0 && imported == total) {
            return <button className="Button btn-primary" onClick={this.hide}>OK</button>;
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

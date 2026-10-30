import React from 'react';
import autoBind from 'react-autobind';
import { dataURLtoFile } from '../../../helpers/common';
import loadImage from 'blueimp-load-image';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';

class ImageHandler extends React.Component {
    fileInput = React.createRef();

    state = {
        currentInvoice: null,
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            loadImage(e.target.files[0], (canvas) => {
                const file = dataURLtoFile(canvas.toDataURL(), "image.jpg");
                this.props.onAdd(file);
            }, {
                maxWidth: 1000,
                maxHeight: 1000,
                orientation: true,
                downsamplingRatio: 0.5,
            });
        }
    }

    handleAddClick(e) {
        e.preventDefault();
        if (!this.props.disableAdd) {
            this.fileInput.value = '';
            this.fileInput.click();
        }
    }

    handleDelete(e, invoice) {
        e.preventDefault();
        this.setState({ currentInvoice: invoice });
        this.deleteModal.show();
    }
    
    handleDeleteConfirm(e) {
        e.preventDefault();
        this.props.onDelete(e, this.state.currentInvoice);
        this.deleteModal.hide();
    }

    handleDeleteCancel(e) {
        e.preventDefault();
        this.deleteModal.hide();
    }

    handleModalHide() {
        this.setState({ currentInvoice: null });
    }

    renderInvoices() {
        return _.map(this.props.invoices, (invoice) => 
            <div key={invoice.id} className={`invoice-wrapper ${this.props.isLoading ? 'disabled' : ''}`}>
                <img className="invoice-image" src={invoice.url}/>
                <div className="icon-wlc-close btn-delete" onClick={e => this.handleDelete(e, invoice)} />
            </div>
        );
    }

    render() {
        return (
            <div className="ImageHandler box add-users-box">
                <div className="view-overlay-alert">
                    <DropModal
                        className="modal overlay-alert"
                        ref={(modal) => { this.deleteModal = modal }}
                        onHide={this.handleModalHide}
                    >
                        <div className="overlay-content">
                            <i
                                className="icon-wlc-close close-button-overlay close-overlay"
                                onClick={this.handleDeleteCancel}
                            />
                            <div className="overlay-body">
                                <div className="scrool-bar">
                                    <h3>Are you sure you want to delete this image?</h3>
                                    <p className="align-center">
                                        <button className="button blue close-overlay" onClick={this.handleDeleteConfirm}>
                                            Delete
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DropModal>
                </div>
                <h3 className="title">{this.props.title}</h3>
                <div className="images-wrapper">
                    <input
                        className="add-file-button"
                        ref={(input) => {this.fileInput = input}} 
                        onChange={this.handleInputChange}
                        type="file"
                        disabled={this.props.isLoading}
                    />
                    <div className={`invoice-wrapper invoice-add ${this.props.isLoading ? 'disabled' : ''}`} onClick={this.handleAddClick}>
                        <span>+</span>
                    </div>
                    {this.renderInvoices()}
                </div>
            </div>
        );
    }
}

export default ImageHandler;
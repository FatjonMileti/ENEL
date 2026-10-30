import React, { Component } from 'react';
import autoBind from 'react-autobind';
import XLSX from 'xlsx';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';

class ImportModal extends Component {
    state = {
        file: null,
        officers: null,
        loading: false,
    };

    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
    }



    buildOfficers(json) {
        const { template } = this.props;
        let officers = [];
        // header on position index = 0
        for (let i = 1; i < json.length; i++) {
            if (json[i].length > 0) {
                const officer = {};
                _.each(template, (column, key) => (officer[key] = json[i][column]));
                officer.index = i;
                officers.push(officer);
            }
        }
        return officers;
    }

    convertToJSON(workbook) {
        const first_sheet_name = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[first_sheet_name];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }

    async parseFile() {
        return new Promise(resolve => {
            if (this.state.file) {
                this.setState({ loading: true });
                const reader = new FileReader();
                reader.readAsArrayBuffer(this.state.file);
                reader.onload = e => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const json = this.convertToJSON(workbook);
                    this.setState(
                        {
                            officers: this.buildOfficers(json),
                            loading: false,
                        },
                        resolve
                    );
                };
            } else {
                resolve();
            }
        });
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

    async handleConfirmClick(e) {
        e.preventDefault();

        this.hide();
        await this.parseFile();
        if (this.props.onConfirm) this.props.onConfirm(e, this.state.officers);
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    handleFileChange(e) {
        this.setState({ file: e.target.files[0] });
    }

    render() {
        return (
            <DropModal
                className="ImportModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Import Officers</div>
                    <div className="data-panel">
                        <div className="row">
                            <input
                                className="offset-md-3 col-md-6"
                                type="file"
                                onChange={this.handleFileChange}
                            />
                        </div>
                    </div>
                    <button className="Button btn-primary" onClick={this.handleConfirmClick}>Confirm</button>                    
                    <button className="Button btn-primary btn-primary-underline" onClick={this.handleDismissClick}>Cancel</button>                    
                </div>
            </DropModal>
        );
    }
}

export default ImportModal;

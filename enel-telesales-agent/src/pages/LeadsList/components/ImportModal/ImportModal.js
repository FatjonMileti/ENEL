import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import XLSX from 'xlsx';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import { buildLead, HEADER_KEY, LEAD_CHANNELS } from 'services/lead';

import './ImportModal.scss';

class ImportModal extends Component {
    state = {
        file: null,
        leads: null,
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

    validateChannel(channel) {
        if (!LEAD_CHANNELS.includes(channel)) {
            return '';
        }

        return channel;
    }

    buildLeads(json) {
        const { template } = this.props;
        let leads = [];
        // on position index 0, 1 are headers
        for (let i = 2; i < json.length; i++) {
            if (json[i].length > 0) {
                const lead = buildLead(json, i, template);
                lead.channel = this.validateChannel(lead.channel);
                lead.index = i;
                lead.originalData = { header: json[HEADER_KEY], body: json[i] };
                leads.push(lead);
            }
        }
        return leads;
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
                            leads: this.buildLeads(json),
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

    async handleConfirmClick(e) {
        e.preventDefault();
        this.hide();
        await this.parseFile();
        if (this.props.onConfirm) this.props.onConfirm(e, this.state.leads);
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
                    <div className="title">Importā Leaduri</div>
                    <div className="data-panel">
                        <div className="row">
                            <input
                                className="offset-md-3 col-md-6"
                                type="file"
                                onChange={this.handleFileChange}
                            />
                        </div>
                    </div>
                    <Button primary value="Importā" onClick={this.handleConfirmClick} />
                    <Button primary underline value="Anuleazā" onClick={this.handleDismissClick} />
                </div>
            </DropModal>
        );
    }
}

export default ImportModal;

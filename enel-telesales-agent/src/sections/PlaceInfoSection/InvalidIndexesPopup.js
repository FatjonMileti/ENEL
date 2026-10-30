import React, { Component } from 'react';
import DropModal from 'reboron/DropModal';

import './InvalidIndexesPopup.scss';

import { Button } from 'components/Button';

class InvalidIndexesPopup extends Component {
    show() {
        this.props.reference.current.show();
    }

    hide() {
        this.props.reference.current.hide();
    }

    render() {
        const invalidIndexes = {
            ele_singlerate: 'ENERGIE ACTIVA – RATA UNICA',
            ele_day: 'ENERGIE ACTIVA – ZONA VARF',
            ele_night: 'ENERGIE ACTIVA – ZONA REST',
            ele_gol: 'ENERGIE ACTIVA – ZONA GOL',
            ele_inductive: 'ENERGIE ACTIVA – REACTIVA INDUCTIVA',
            ele_capacitive: 'ENERGIE ACTIVA – REACTIVA CAPACITIVE',
            gas: 'ENERGIE ACTIVA – VOLUM MASURAT',
        };

        return (
            <>
                <DropModal
                    className="InvalidIndexesPopup"
                    ref={this.props.reference}
                    // onShow={this.handleShow}
                    // onHide={this.handleHide}
                >
                    <div className="modal-overlay">
                        <div className="title">Index nevalidat pe cadranul(e):</div>
                        <div className="data-panel">
                            {this.props.errors.map(error => (
                                <h4>{invalidIndexes[error.replace(/meas_index_|-\d+/g, '')]}</h4>
                            ))}
                        </div>
                        <div>
                            <Button primary value="Reinsereaza" onClick={() => this.hide()} />
                            <Button
                                primary
                                underline
                                value="Continua"
                                onClick={() => {
                                    this.hide();
                                    this.props.continue();
                                }}
                            />
                        </div>
                    </div>
                </DropModal>
            </>
        );
    }
}

export default InvalidIndexesPopup;

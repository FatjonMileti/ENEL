import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import fileService from 'services/file';
import {
    fetchAgentSignature,
    setAgentSignature,
    uploadAgentSignature,
} from 'store/documents/actions';
import { getAgentSignature } from 'store/documents/selectors';

import SignatureCanvas from 'components/Signature/components/SignatureCanvas';
import { Button } from 'components/Button';

import './Signature.scss';

class Signature extends Component {
    state = {
        signatureError: false,
        signed: false,
        mounted: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.setState({ mounted: true });
        setTimeout(() => {
            if (this.signaturePad && !this.state.signed) {
                this.signaturePad.clearTransparent();
                this.props.fetchAgentSignature();
            }
        }, 1000);
    }

    async componentDidUpdate() {
        const { signature } = this.props;
        if (this.signaturePad && this.container && signature && !this.state.signed) {
            const { w, h } = await fileService.getImageDimensions(signature);
            this.setState({ signed: true });
            this.signaturePad.fromDataURL(signature, {
                width: this.container.offsetWidth,
                height: (h * this.container.offsetWidth) / w,
            });
        }
    }

    handleSaveClick(e) {
        e.preventDefault();
        this.props.uploadAgentSignature(this.signaturePad.toDataURL());
        this.props.onSaveClick();
    }

    handleClearClick(e) {
        e.preventDefault();
        this.props.setAgentSignature(null);
        this.signaturePad.clearTransparent();
        this.setState({ signed: false });
    }

    handleSignClick(e) {
        e.preventDefault();
        this.setState({
            signed: true,
        });
    }

    removeSignatureError(e) {
        this.setState({ signatureError: false });
    }

    renderSignatureCanvas() {
        if (this.state.mounted) {
            return (
                <SignatureCanvas
                    ref={c => {
                        this.signaturePad = c;
                    }}
                    penColor="#1155cc"
                    backgroundColor="#ffffff"
                    minWidth={1.5}
                    maxWidth={3}
                    canvasProps={{
                        id: 'signature',
                        width: this.container.offsetWidth,
                        height: this.container.offsetHeight,
                        className: 'signature',
                    }}
                    onBegin={this.removeSignatureError}
                />
            );
        }
    }

    render() {
        return (
            <div className="Signature">
                <div
                    className="canvas-container spaced-top"
                    ref={c => {
                        this.container = c;
                    }}
                >
                    {this.renderSignatureCanvas()}
                    {this.state.signed && (
                        <Button
                            secondary
                            onClick={this.handleClearClick}
                            className="btn-delete"
                            value="Sterge"
                        />
                    )}
                    {!this.state.signed && (
                        <Button
                            primary
                            onClick={this.handleSaveClick}
                            className="btn-overlay"
                            value="Continua"
                        />
                    )}
                    {this.state.signed && <div className="signature-overlay"></div>}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    signature: getAgentSignature(state),
});

const mapDispatchToProps = {
    uploadAgentSignature,
    setAgentSignature,
    fetchAgentSignature,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Signature);

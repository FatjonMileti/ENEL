import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import pageService from 'services/page';
import fileService from 'services/file';
import { uploadSignature, setSignature } from 'store/documents/actions';
import { getSignature } from 'store/documents/selectors';
import SignatureCanvas from 'react-signature-canvas';
import Button from 'components/Button';

import './Signature.scss';

const Signature = ({ signature, uploadSignature, setSignature }) => {
    const [state, setState] = useState({
        signatureError: false,
        signatureOn: false,
        signed: false,
        mounted: false,
    });

    const signaturePadRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        setState((prevState) => ({ ...prevState, mounted: true }));
        setTimeout(() => {
            if (signaturePadRef.current && !state.signed) {
                // signaturePadRef.current.clearTransparent();
            }
        }, 1000);
    }, []);

    useEffect(() => {
        const updateSignature = async () => {
            if (signaturePadRef.current && containerRef.current && signature && !state.signed) {
                const { w, h } = await fileService.getImageDimensions(signature);
                setState((prevState) => ({ ...prevState, signed: true }));
                signaturePadRef.current.fromDataURL(signature, {
                    width: containerRef.current.offsetWidth,
                    height: (h * containerRef.current.offsetWidth) / w,
                });
            }
        };
        updateSignature();
    }, [signature, state.signed]);

    const handleSaveClick = (e) => {
        e.preventDefault();
        setState((prevState) => ({ ...prevState, signatureOn: false }));
        uploadSignature(signaturePadRef.current.toDataURL());
    };

    const handleClearClick = (e) => {
        e.preventDefault();
        setSignature(null);
        signaturePadRef.current.clear();
        if (!state.signatureOn) {
            setState((prevState) => ({
                ...prevState,
                signed: false,
                signatureOn: false,
            }));
        }
    };

    const handleSignClick = (e) => {
        e.preventDefault();
        setState((prevState) => ({
            ...prevState,
            signed: true,
            signatureOn: true,
        }));
    };

    const removeSignatureError = (e) => {
        setState((prevState) => ({ ...prevState, signatureError: false }));
    };

    const renderSignatureCanvas = () => {
        if (state.mounted) {
            return (
                <SignatureCanvas
                    ref={signaturePadRef}
                    penColor="#1155cc"
                    backgroundColor="#ffffff"
                    minWidth={1.5}
                    maxWidth={3}
                    canvasProps={{
                        id: 'signature',
                        width: containerRef.current.offsetWidth,
                        height: containerRef.current.offsetHeight,
                        className: 'signature',
                    }}
                    onBegin={removeSignatureError}
                />
            );
        }
    };

    return (
        <div className="Signature">
            <div className="canvas-container spaced-top" ref={containerRef}>
                {renderSignatureCanvas()}
                {(state.signed || !pageService.isMobile()) && (
                    <Button
                        secondary
                        onClick={handleClearClick}
                        className="btn-delete"
                        value="Sterge"
                    />
                )}
                {!state.signed && (
                    <Button
                        outline
                        onClick={handleSignClick}
                        className="btn-overlay"
                        value="Semnează"
                    />
                )}
                {state.signatureOn && (
                    <Button
                        primary
                        onClick={handleSaveClick}
                        className="btn-save"
                        value="Salvează"
                    />
                )}
                {!state.signatureOn && <div className="signature-overlay" />}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    signature: getSignature(state),
});

const mapDispatchToProps = {
    uploadSignature,
    setSignature,
};

export default connect(mapStateToProps, mapDispatchToProps)(Signature);

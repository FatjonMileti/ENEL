import React from 'react';
import PropTypes from 'prop-types';
import SignatureCanvas from 'components/signature';
import Button from 'components/validation/button';

const propTypes = {
    loading: PropTypes.bool.isRequired,
    removeSignatureError: PropTypes.func.isRequired,
    pageService: PropTypes.object.isRequired,
    signed: PropTypes.bool.isRequired,
    handleClearClick: PropTypes.func.isRequired,
    handleSignClick: PropTypes.func.isRequired,
    signatureOn: PropTypes.bool.isRequired,
    handleSaveClick: PropTypes.func.isRequired,
    setSignaturePad: PropTypes.func.isRequired,
};

const Signature = ({
    loading,
    removeSignatureError,
    pageService,
    signed,
    handleClearClick,
    handleSignClick,
    signatureOn,
    handleSaveClick,
    setSignaturePad,
}) => {
    if (loading) {
        return 'Se incarca...';
    }

    return (
        <div>
            <SignatureCanvas
                ref={(c) => { setSignaturePad(c); }}
                penColor="#1155cc"
                backgroundColor="#ffffff"
                minWidth={1.5}
                maxWidth={3}
                canvasProps={{
                    id: 'signature',
                    width: 600,
                    height: 400,
                    className: 'signature',
                }}
                onBegin={removeSignatureError}
            />
            {((pageService.isMobile() && signed) || !pageService.isMobile()) &&
                <button className="btn btn-dark btn-with-icon btn-delete" onClick={handleClearClick}>
                    Șterge
                    <svg viewBox="0 0 10 11">
                        <g className="st0">
                            <path
                                className="st1"
                                d="M6.5,5.5l3.3,3.4C9.9,9,10,9.1,10,9.2S9.9,9.5,9.8,9.6l-0.8,0.8c-0.1,0.1-0.2,0.2-0.3,0.2s-0.3-0.1-0.3-0.2
                                L5,7l-3.4,3.3c-0.1,0.1-0.2,0.2-0.3,0.2S1,10.4,0.9,10.3L0.2,9.6C0.1,9.5,0,9.4,0,9.2S0.1,9,0.2,8.9l3.3-3.4L0.2,2.1
                                C0.1,2,0,1.9,0,1.8s0.1-0.3,0.2-0.3l0.8-0.8C1,0.6,1.1,0.5,1.3,0.5s0.3,0.1,0.3,0.2L5,4l3.4-3.3c0.1-0.1,0.2-0.2,0.3-0.2
                                S9,0.6,9.1,0.7l0.8,0.8C9.9,1.5,10,1.6,10,1.8S9.9,2,9.8,2.1L6.5,5.5z"
                            />
                        </g>
                    </svg>
                </button>
            }
            {pageService.isMobile() && !signed &&
                <Button type="submit" className="btn btn-primary btn-overlay" onClick={handleSignClick}>
                    Semnează
                </Button>
            }
            {pageService.isMobile() && signatureOn &&
                <Button type="submit" className="btn btn-primary btn-save" onClick={handleSaveClick}>
                    Salvează
                </Button>
            }
            {pageService.isMobile() && !signatureOn && <div className="signature-overlay"></div>}
        </div>
    );
};

Signature.propTypes = propTypes;

export default Signature;

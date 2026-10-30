import React from 'react';
import Form from 'components/validation/form';
import Button from 'components/validation/button';
import Cropper from 'react-cropper';
import Slider from 'rc-slider/lib/Slider';
import pageService from 'services/page';
import PropTypes from 'prop-types';
import _ from 'lodash';


const propTypes = {
    picture: PropTypes.string,
    angle: PropTypes.number.isRequired,
    handleAdd: PropTypes.func.isRequired,
    setCropper: PropTypes.func.isRequired,
    setVariables: PropTypes.func.isRequired,
};

const defaultProps = {
    picture: null,
};

const UploadInteractionStep2 = ({
    picture,
    angle,
    handleAdd,
    setCropper,
    setVariables,
    type,
    title
}) => {
    let cropper = null;
    const zoomIn = () => {
        cropper.zoom(0.1);
    };

    const zoomOut = () => {
        cropper.zoom(-0.1);
    };

    const setGlobalCropper = (c) => {
        cropper = c;
        setCropper(c);
    }

    const rotatePicture = (value) => {
        setVariables({ angle: value });
    };

    const handleRedo = (e) => {
        e.preventDefault();
        setVariables({ step: 0 });
    };

    return (
        <div className="container" style={{ marginLeft: 'unset' }}>
            <Form>
                <div className="row" style={{ marginLeft: '0' }}>
                    <div id="pictureContainer">
                        <div className="zoom zoom-in icon-plus hide-mobile" onClick={zoomIn}>
                        </div>
                        <div className="zoom zoom-out icon-minus hide-mobile" onClick={zoomOut}>
                        </div>
                        <Cropper
                            ref={(c) => { setGlobalCropper(c); }}
                            src={picture}
                            style={{ height: pageService.isMobile() ? 250 : 400, width: '100%' }}
                            aspectRatio={105 / 74}
                            // crop={cropPicture}
                            guides={false}
                            movable
                            scalable={false}
                            rotateTo={-angle}
                            zoomOnWheel={false}
                            zoomOnTouch
                            cropBoxMovable={false}
                            cropBoxResizable={false}
                            dragMode="move"
                            minCropBoxHeight={200}
                        />
                        <br />
                        <p>Roteşte</p>
                        <Slider
                            included={false}
                            min={-180}
                            max={180}
                            value={angle}
                            onChange={rotatePicture}
                            marks={{
                                '-180': <span>-180&deg;</span>,
                                '-90': <span>-90&deg;</span>,
                                0: <span>0&deg;</span>,
                                90: <span>90&deg;</span>,
                                180: <span>180&deg;</span>,
                            }}
                        />
                    </div>
                </div>

                <div className="offset-top col-md-12" style={{ paddingLeft: '0' }}>

                    <button type="submit" className="btn btn-outline-secondary col-12" style={{ marginBottom: '10px' }} onClick={handleRedo}>
                        Reîncearcă
                    </button>
                    <Button type="submit" className="btn btn-primary col-12" onClick={(e) => { handleAdd(e, type, title); }}>
                        Continuă
                    </Button>
                </div>
            </Form>
        </div>
    );
};

UploadInteractionStep2.propTypes = propTypes;
UploadInteractionStep2.defaultProps = defaultProps;

export default UploadInteractionStep2;

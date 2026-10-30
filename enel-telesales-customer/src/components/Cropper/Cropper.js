import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import ReactCropper from 'react-cropper';
// eslint-disable-next-line
import 'cropperjs/dist/cropper.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import pageService from 'services/page';
import Button from 'components/Button';

import './Cropper.scss';

const RATIO = {
    idCard: 105 / 74,
    page: 210 / 297,
};

const propTypes = {
    image: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    aspect: PropTypes.string.isRequired,
};

class Cropper extends Component {
    state = {
        angle: 0,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    zoomIn() {
        this.picture.zoom(0.1);
    }

    zoomOut() {
        this.picture.zoom(-0.1);
    }

    rotatePicture(value) {
        const angleDifference = value - this.state.angle;
        this.picture.rotate(angleDifference);
        this.setState({ angle: value });
    }

    render() {
        return (
            <div className="Cropper">
                <div className="container main-area">
                    <div className="row justify-content-center">
                        <div id="pictureContainer">
                            <div
                                className="zoom zoom-in icon-plus hide-mobile"
                                onClick={this.zoomIn}
                                role="presentation"
                            />
                            <div
                                className="zoom zoom-out icon-minus hide-mobile"
                                onClick={this.zoomOut}
                                role="presentation"
                            />
                            <ReactCropper
                                onInitialized={(c) => {
                                    this.picture = c;
                                }}
                                src={this.props.image}
                                style={{
                                    height: pageService.isMobile() ? 250 : 400,
                                    width: '100%',
                                }}
                                initialAspectRatio={RATIO[this.props.aspect]}
                                guides={false}
                                movable
                                scalable={false}
                                zoomOnWheel={false}
                                zoomOnTouch
                                cropBoxMovable={false}
                                cropBoxResizable={false}
                                dragMode="move"
                                minCropBoxHeight={this.props.aspect === 'idCard' ? 200 : 400}
                            />
                            <br />
                            <p>Roteşte</p>
                            <Slider
                                included={false}
                                min={-180}
                                max={180}
                                value={this.state.angle}
                                onChange={this.rotatePicture}
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
                </div>
                <div className="text-center col-md-12">
                    <Button primary underline onClick={this.props.onCancel} value="Anuleaza" />
                    <Button primary onClick={this.props.onSave} value="Salveaza" />
                </div>
            </div>
        );
    }
}

Cropper.propTypes = propTypes;

export default Cropper;

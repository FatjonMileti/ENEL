import React, { Component } from 'react';
import ReactCropper from 'react-cropper';
import Slider from 'rc-slider/lib/Slider';
import 'cropperjs/dist/cropper.css';
import 'rc-slider/assets/index.css';

import pageService from '../../services/page';
import { Button } from 'components/Button';

import './Cropper.scss';

const RATIO = {
    idCard: 105 / 74,
    page: 210 / 297,
};

interface Props {
    image: string;
    aspect: string;
    onCancel: () => void;
    onSave: () => void;
}

interface State {
    angle: number;
}

export class Cropper extends Component<Props, State> {
    public picture: any;

    public readonly state = {
        angle: 0,
    };

    render() {
        return (
            <div className="Cropper">
                <div className="container main-area">
                    <div className="row justify-content-center">
                        <div id="pictureContainer">
                            <div
                                className="zoom zoom-in ion-md-add hide-mobile"
                                onClick={() => this.picture.zoom(0.1)}
                                role="presentation"
                            />
                            <div
                                className="zoom zoom-out ion-md-remove hide-mobile"
                                onClick={() => this.picture.zoom(-0.1)}
                                role="presentation"
                            />
                            <ReactCropper
                                ref={c => (this.picture = c)}
                                src={this.props.image}
                                style={{
                                    height: pageService.isMobile() ? 250 : 400,
                                    width: '100%',
                                }}
                                aspectRatio={RATIO[this.props.aspect]}
                                guides={false}
                                movable
                                scalable={false}
                                rotateTo={-this.state.angle}
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
                                onChange={angle => this.setState({ angle })}
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

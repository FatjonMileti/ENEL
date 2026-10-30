import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';

import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import Button from 'components/Button';

import './Scanner.scss';

const propTypes = {
    title: PropTypes.string,
    format: PropTypes.string,
    onBack: PropTypes.func.isRequired,
    onPicture: PropTypes.func.isRequired,
};

const defaultProps = {
    title: '',
    format: 'ci',
};

class Scanner extends Component {
    state = {
        webcamAvailable: false,
        webcamError: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    getFrameStyle() {
        const ratio = this.props.format === 'ci' ? 105 / 74 : 210 / 297;
        const height = window.innerHeight * 0.65;
        const width = ratio * height;

        return {
            width: `${width}px`,
            height: `${height}px`,
            top: `calc(50% - ${height / 2 + 25}px)`,
            left: `calc(50% - ${width / 2}px)`,
        };
    }

    handleBack() {
        this.props.onBack();
    }

    handlePictureTake(e) {
        e.preventDefault();
        const image = this.webcam.getScreenshot();
        this.props.onPicture(image);
    }

    webcamInit() {
        this.setState({
            webcamAvailable: true,
        });
    }

    webcamError(e) {
        this.setState({
            webcamError: true,
        });
    }

    render() {
        return (
            <div className="Scanner">
                <ConfirmOverlay
                    title="Camera nu a fost detectată"
                    confirmLabel="Înapoi"
                    noDismiss
                    show={this.state.webcamError}
                    onConfirm={this.handleBack}
                />
                <header className="container top-header">
                    <div className="row logo-bar">
                        <div className="title">
                            <p>{this.props.title}</p>
                        </div>
                    </div>
                </header>
                <div className="photo-area">
                    <div className="framing" style={this.getFrameStyle()}>
                        <div className="framing-square f--1" />
                        <div className="framing-square f--2" />
                        <div className="framing-square f--3" />
                        <div className="framing-square f--4" />
                    </div>
                    <Webcam
                        audio={false}
                        ref={c => {
                            this.webcam = c;
                        }}
                        screenshotFormat="image/png"
                        className="photo-test"
                        onUserMedia={this.webcamInit}
                        onUserMediaError={this.webcamError}
                    />
                    <div className="photo-buttons text-center">
                        <Button
                            value="Înapoi"
                            primary
                            underline
                            onClick={this.handleBack}
                        />
                        <Button
                            value="Fotografiază"
                            primary
                            disabled={!this.state.webcamAvailable}
                            onClick={this.handlePictureTake}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

Scanner.propTypes = propTypes;
Scanner.defaultProps = defaultProps;

export default Scanner;

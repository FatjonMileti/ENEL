import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import $ from 'jquery';

import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import './Scanner.scss';


const propTypesWebCam = {
    goBack: PropTypes.func,
    handlePictureTake:PropTypes.func,
    setWebCamError: PropTypes.func,
};

const defaultPropsWebCam = {
    goBack: ()=> {},
    handlePictureTake:(picture)=> {},
    setWebCamError: (error) => {},
};
const CustomWebcam = (props) => {

    const { handlePictureTake, goBack, setWebCamError } = props
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    const startCapture = useCallback(async () => {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
            setIsCapturing(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing the camera", err);
            setError("Failed to access the camera. Please make sure you've granted the necessary permissions.");
            setWebCamError(err)
        }
    }, []);

    useEffect(() => {
        if (isCapturing && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCapturing]);

    const stopCapture = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCapturing(false);
    }, []);

    const captureImage = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);
            handlePictureTake(imageDataUrl)
        }
    }, []);

    useEffect(() => () => {
        stopCapture();
    }, [stopCapture]);

    return (
        <div className="container ">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="mb-3 bg-light">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-100 h-100 object-fit-cover"
                            style={{display: isCapturing ? 'block' : 'none'}}
                        />
                        {!isCapturing && (
                            <div className="w-100 d-flex align-items-center justify-content-center" style={{height: '300px'}}>
                                Camera foto este oprită!
                            </div>
                        )}
                    </div>

                    <div className="d-grid gap-2">
                        {!isCapturing ? (
                            <div className="photo-buttons text-center">
                                <button className="btn btn-underline-primary"
                                    onClick={startCapture}
                                >
                                    Pornește camera
                                </button>
                            </div>
                        ) : (
                            <React.Fragment>

                                <div className="photo-buttons text-center">
                                    <button type="submit" className="btn btn-underline-primary"
                                        onClick={goBack}>
                                        Înapoi
                                    </button>
                                    <button type="submit" className="btn btn-primary"
                                        disabled={!isCapturing} onClick={captureImage}>
                                        Fotografiază
                                    </button>
                                </div>

                            </React.Fragment>
                        )}
                    </div>

                    {capturedImage && (
                        <div className="mt-4">
                            <h2 className="h4 mb-2">Captured Photo:</h2>
                            <img src={capturedImage} alt="captured" className="img-fluid rounded" />
                        </div>
                    )}

                    <canvas ref={canvasRef} className="d-none" width={640} height={480} />
                </div>
            </div>
        </div>
    );
};

CustomWebcam.propTypes = propTypesWebCam;
CustomWebcam.defaultProps = defaultPropsWebCam;

const propTypes = {
    title: PropTypes.string,
    format: PropTypes.string,
    onBack: PropTypes.func.isRequired,
    onPicture: PropTypes.func.isRequired,
    handleUpload:PropTypes.func,
};

const defaultProps = {
    title: '',
    format: 'ci',
    handleUpload:(picture)=> {},
};

class Scanner extends Component {

    state = {
        webcamError: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        $('body').addClass('fotografiere-ci');
    }

    componentWillUnmount() {
        $('body').removeClass('fotografiere-ci');
    }

    getFrameStyle() {
        const ratio = this.props.format == 'ci' ? 105 / 74 : 210 / 297;
        const height = window.innerHeight * 0.65;
        const width = ratio * height;

        return {
            width: `${width}px`,
            height: `${height}px`,
            top: `calc(50% - ${height / 2 + 25}px)`,
            left: `calc(50% - ${width / 2}px)`,
        }
    }

    handleBack() {
        this.props.onBack();
    }

    handlePictureTake(image) {
        this.props.onPicture(image);
    }

    webcamError(e) {
        this.setState({
            webcamError: true,
        });
    }

    render() {
        const description = (
            <span>
                <input type="file" id="upload" onChange={this.props.handleUpload} />
                Camera dispozitivului nu a fost detectată.<br />
                <label htmlFor="upload">Încarcă</label> o fotografie existentă.
            </span>
        );

        return (
            <div className="Scanner">
                <ConfirmOverlay
                    title="Camera nu a fost detectată"
                    description={description}
                    confirmLabel="Înapoi"
                    noDismiss
                    show={this.state.webcamError}
                    onConfirm={this.handleBack}
                />
                <header className="container top-header header--green header--small has--progress">
                    <div className="row logo-bar">
                        <div className="title">
                            <p>{this.props.title}</p>
                        </div>
                    </div>
                </header>
                <div className="photo-areaa">
                    <CustomWebcam handlePictureTake={this.handlePictureTake} goBack={this.handleBack} setWebCamError={this.webcamError}/>
                </div>
            </div>
        );
    }
}

Scanner.propTypes = propTypes;
Scanner.defaultProps = defaultProps;

export default Scanner;

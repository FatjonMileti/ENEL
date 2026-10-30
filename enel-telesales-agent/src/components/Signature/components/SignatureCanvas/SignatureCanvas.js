import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SignaturePad from 'signature_pad';
import trimCanvas from 'trim-canvas';

export default class SignatureCanvas extends Component {
    static propTypes = {
        // signature_pad's props
        velocityFilterWeight: PropTypes.number,
        minWidth: PropTypes.number,
        maxWidth: PropTypes.number,
        minDistance: PropTypes.number,
        dotSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        penColor: PropTypes.string,
        throttle: PropTypes.number,
        onEnd: PropTypes.func,
        onBegin: PropTypes.func,
        // props specific to the React wrapper
        canvasProps: PropTypes.object,
        clearOnResize: PropTypes.bool,
    };

    static defaultProps = {
        clearOnResize: true,
    };

    _sigPad = null;

    _excludeOurProps = () => {
        const { canvasProps, clearOnResize, ...sigPadProps } = this.props;
        return sigPadProps;
    };

    componentDidMount() {
        this._sigPad = new SignaturePad(this._canvas, this._excludeOurProps());
        this._resizeCanvas();
        this.clear();
        this.on();
    }

    componentWillUnmount() {
        this.off();
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.globalAlpha = 0;
    }

    // propagate prop updates to SignaturePad
    componentDidUpdate() {
        Object.assign(this._sigPad, this._excludeOurProps());
    }

    // return the canvas ref for operations like toDataURL
    getCanvas = () => this._canvas;

    // return a trimmed copy of the canvas
    getTrimmedCanvas = () => {
        // copy the canvas
        const copy = document.createElement('canvas');
        copy.width = this._canvas.width;
        copy.height = this._canvas.height;
        copy.getContext('2d').drawImage(this._canvas, 0, 0);
        // then trim it
        return trimCanvas(copy);
    };

    // return the internal SignaturePad reference
    getSignaturePad = () => this._sigPad;

    _checkClearOnResize = () => {
        if (!this.props.clearOnResize) {
            return;
        }
        this._resizeCanvas();
    };

    _resizeCanvas = () => {
        const canvasProps = this.props.canvasProps || {};
        const { width, height } = canvasProps;

        const canvas = this._canvas;
        /* When zoomed out to less than 100%, for some very strange reason,
      some browsers report devicePixelRatio as less than 1
      and only part of the canvas is cleared then. */
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        // only change width/height if none has been passed in as a prop
        if (!width) {
            canvas.width = canvas.offsetWidth * ratio;
        }
        if (!height) {
            canvas.height = canvas.offsetHeight * ratio;
        }
        if (!width || !height) {
            canvas.getContext('2d').scale(ratio, ratio);
        }
    };

    render() {
        const { canvasProps } = this.props;
        return (
            <canvas
                ref={ref => {
                    this._canvas = ref;
                }}
                {...canvasProps}
            />
        );
    }

    // all wrapper functions below render
    on = () => {
        window.addEventListener('resize', this._checkClearOnResize);
        return this._sigPad.on();
    };

    off = () => {
        window.removeEventListener('resize', this._checkClearOnResize);
        return this._sigPad.off();
    };

    clear = () => this._sigPad.clear();

    clearTransparent = () => {
        this.clear();
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };

    isEmpty = () => this._sigPad.isEmpty();

    fromDataURL = (dataURL, options) => this._sigPad.fromDataURL(dataURL, options);

    toDataURL = (type, encoderOptions) => this._sigPad.toDataURL(type, encoderOptions);

    fromData = pointGroups => this._sigPad.fromData(pointGroups);

    toData = () => this._sigPad.toData();

    toDataTransparent = () => {
        const ctx = this._canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
        const pixel = imageData.data;

        let r = 0;
        let g = 1;
        let b = 2;
        let a = 3;
        for (let p = 0; p < pixel.length; p += 4) {
            if (pixel[p + r] === 255 && pixel[p + g] === 255 && pixel[p + b] === 255) {
                pixel[p + a] = 0;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return ctx.toDataURL('image/png');
    };
}

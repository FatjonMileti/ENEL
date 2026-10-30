import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import { dataURLtoBlob } from '../utils';
import { createCanvas } from 'canvas';
import { getDocument } from 'pdfjs-dist/webpack';
import loadImage from 'blueimp-load-image';

const MAX_SIZE = 1 * 1024 * 1024; // 1MB

class FileService {
    TYPES = {
        PDF: 'application/pdf',
    };

    isPDF(file) {
        return file.type === this.TYPES.PDF;
    }

    async convertPDFToImages(pdfBase64, outputFormat = 'dataURL') {
        const response = await fetch(pdfBase64);
        const pdfArrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(pdfArrayBuffer);

        const pdf = await getDocument({ data }).promise;
        const images = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });

            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            await page.render({ canvasContext: context, viewport }).promise;

            if (outputFormat === 'dataURL') {
                const imageDataUrl = canvas.toDataURL();
                images.push(imageDataUrl);
            } else if (outputFormat === 'blob') {
                const imageDataBlob = await new Promise((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to convert canvas to Blob'));
                        }
                    });
                });
                images.push(imageDataBlob);
            } else {
                throw new Error('Invalid output format');
            }
        }

        return images;
    }

    async convertPDFToImagesOld(fileData) {
        const { GlobalWorkerOptions } = pdfjs;
        GlobalWorkerOptions.workerSrc =
            '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.489/pdf.worker.js';
        const binary = this.convertDataURLToBinary(fileData);
        const pdf = await pdfjs.getDocument(binary);

        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            // eslint-disable-next-line no-await-in-loop
            const page = await pdf.getPage(i);
            const viewport = page.getViewport(2);
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // eslint-disable-next-line no-await-in-loop
            await page.render({
                canvasContext: context,
                viewport,
            });

            pages.push(canvas.toDataURL());
        }

        return pages;
    }

    async readFile(file) {
        return new Promise((resolve) => {
            if (this.isPDF(file)) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = async () => {
                    resolve(reader.result);
                };
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                loadImage(
                    file,
                    (canvas) => {
                        resolve(reader.result);
                    },
                    {
                        maxWidth: 1000,
                        maxHeight: 1000,
                        orientation: true,
                        downsamplingRatio: 0.5,
                    }
                );
            }
        });
    }

    async readImages(file) {
        let images = [];
        const compressed = [];
        if (this.isPDF(file)) {
            const fileData = await this.readFile(file);
            images = await this.convertPDFToImages(fileData);
        } else {
            images.push(await this.readFile(file));
        }

        for (let i = 0; i < images.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            compressed.push(await this.resize(images[i]));
        }

        return compressed;
    }

    async resize(imageData, maxSize = MAX_SIZE) {
        const blob = dataURLtoBlob(imageData);
        if (blob.size < maxSize) {
            return Promise.resolve(imageData);
        }

        const img = new Image();
        img.src = imageData;

        return new Promise((resolve) => {
            img.onload = () => {
                const RATIO = 0.8;
                const canvas = loadImage.scale(img, {
                    maxWidth: img.width * RATIO,
                    maxHeight: img.height * RATIO,
                    downsamplingRatio: 0.5,
                    canvas: true,
                });
                resolve(this.resize(canvas.toDataURL()));
            };
        });
    }

    convertDataURLToBinary(dataURL) {
        const BASE64_MARKER = ';base64,';
        const base64Index = dataURL.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        const base64 = dataURL.substring(base64Index);
        const raw = window.atob(base64);
        const rawLength = raw.length;
        const array = new Uint8Array(new ArrayBuffer(rawLength));

        for (let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }

    getImageDimensions(file) {
        return new Promise(function (resolved, rejected) {
            var i = new Image();
            i.onload = function () {
                resolved({ w: i.width, h: i.height });
            };
            i.src = file;
        });
    }
}

export default new FileService();

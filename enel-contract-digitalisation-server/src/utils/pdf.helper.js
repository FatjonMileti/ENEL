const hummus = require('muhammara');
const logger = require('../utils/logger');
const PDFParser = require('pdf2json');
const streams = require('memory-streams');

exports.findCNP = function (pdfBuffer, cnp) {
    return new Promise((resolve, reject) => {
        let foundCNP = false;
        const pdfParser = new PDFParser();
        pdfParser.parseBuffer(pdfBuffer);

        // Event handlers
        pdfParser.on('pdfParser_dataError', errData => {
            logger.error(errData.parserError);
            reject(errData);
        });

        pdfParser.on('pdfParser_dataReady', async pdfData => {
            try {
                const pages = pdfData.formImage.Pages;
                for (const page of pages) {
                    const texts = page.Texts;
                    for (const text of texts) {
                        if (text.R && text.R[0] && text.R[0].T && text.R[0].T.trim() === cnp.trim()) {
                            foundCNP = true;
                            break;
                        }
                    }
                    if (foundCNP)
                        break;
                };

                resolve(foundCNP);
            } catch (err) {
                reject(err);
            }
        });

    });
};

exports.addImageToPdf = function (pdfBuffer, imagePath, coords) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.parseBuffer(pdfBuffer);

        // Event handlers
        pdfParser.on('pdfParser_dataError', errData => {
            logger.error(errData.parserError);
            reject(errData);
        });

        pdfParser.on('pdfParser_dataReady', async () => {
            try {
                const writer = new streams.WritableStream();

                const pdfReadStream = new hummus.PDFRStreamForBuffer(pdfBuffer);
                const pdfWriteStream = new hummus.PDFStreamForResponse(writer);

                const pdfWriter = hummus.createWriterToModify(pdfReadStream, pdfWriteStream);

                //signs all pages
                if (coords.all === true) {
                    for (let i = 0; i < 10; i++) {
                        try {
                            const imageOptions = {
                                index: i,
                                transformation: { width: coords.w || 75, height: coords.h || 35, proportional: true, fit: true }
                            };

                            const pageModifier = new hummus.PDFPageModifier(pdfWriter, i, true);
                            const pageContext = pageModifier.startContext().getContext();
                            pageContext.drawImage(coords.x || 0, coords.y || 0, imagePath, imageOptions);
                            pageModifier.endContext().writePage();
                        } catch (ex) {
                            logger.error(ex);
                        }
                    }
                } else {
                    let pageModifier;
                    let pageContext;
                    let lastPageIndex = false;
                    coords.sort((a, b) => (a.page > b.page) ? 1 : ((b.page > a.page) ? -1 : 0)).forEach((coordinate, i) => {
                        try {
                            if (lastPageIndex === false) {
                                //first run
                                lastPageIndex = coordinate.page;
                                pageModifier = new hummus.PDFPageModifier(pdfWriter, coordinate.page, true);
                                pageContext = pageModifier.startContext().getContext();
                            }

                            if (coordinate.page != lastPageIndex) { //save current progress
                                pageModifier.endContext().writePage();
                                pageModifier = new hummus.PDFPageModifier(pdfWriter, coordinate.page, true);
                                pageContext = pageModifier.startContext().getContext();
                            }

                            const imageOptions = {
                                index: i,
                                transformation: { width: coordinate.w || 75, height: coordinate.h || 35, proportional: true, fit: true }
                            };
                            pageContext.drawImage(coordinate.x || 0, coordinate.y || 0, imagePath, imageOptions);

                            if (coords.length === i + 1) {//if last element save
                                pageModifier.endContext().writePage();
                            }
                        }
                        catch (ex) {
                            logger.error(ex);
                        }
                    });
                }

                pdfWriter.end();
                resolve(writer.toBuffer());
            } catch (err) {
                reject(err);
            }
        });

    });
};
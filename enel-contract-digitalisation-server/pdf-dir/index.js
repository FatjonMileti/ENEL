let fileHelper = require('../src/utils/file.helper.js');
const pdfHelper = require('../src/utils/pdf.helper');
var path = require('path');

(async () => {
    let id = 1;
    let coords = [{ x: 340, y: 13, page: 0 }];

    let buffer = await fileHelper.readFile(`${path.join(path.resolve(__dirname), '../pdf-dir')}/${id}.pdf`);
    let signedBuffer = await pdfHelper.addImageToPdf(buffer,
        `${path.join(path.resolve(__dirname), '../pdf-dir')}/signature.png`,
        coords
    );
    await fileHelper.writeFile(`${path.join(path.resolve(__dirname), '../pdf-dir')}/RESULT.pdf`, signedBuffer);
})();

//https://github.com/galkahana/HummusJS/blob/master/tests/Xcryption.js#L75
// /https://pdfhummus.com/post/147451287581/hummus-1058-and-pdf-writer-updates-encryption
//https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/pdf_reference_archives/PDFReference.pdf
// const hummus = require('hummus');
// const fs = require('fs');

// hummus.recrypt(
//     __dirname + '/test.pdf',
//     __dirname + '/out.pdf',
//     {
//         userPassword: '',
//         // password: 'fullscreen',
//         ownerPassword: 'fullscreen',
//         userProtectionFlag: 3,
//         version: hummus.ePDFVersion16
//     });
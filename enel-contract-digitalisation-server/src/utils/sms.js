const fileHelper = require('./file.helper.js');

module.exports = async(phone, message) => {
    if (!phone) {
        return {
            status: false,
            message: 'User has no phone number!'
        };
    }
    try {
        await fileHelper.writeFile(`${process.env.SMS_PATH}/${phone}_${+ new Date()}_SMS.CSV`, `"${message}";"${phone}"`);
        return {
            status: true,
            message: 'SMS was written to file and will be sent!'
        };
    } catch (e) {
        return {
            status: false,
            message: `Something is wrong when trying to write in SMS file ${e}`
        };

    }
};
const moment = require('moment');
const typeOfRequest = {
    'CNPCUI': 'CNP/CUI',
     'COD_CLIENT': 'Cod client' ,
     'POD': 'POD' ,
     'PHONE': 'Numar telefon',
 }

const getDefaultReport = async (app, rows) => {
    let xls = [
        'Nr interogare',
        'Tip interogare',
        'Valoare interogare',
        'D2D/Shop/Telesales',
        'Nume Partener',
        'User',
        'Nume',
        'Data/Timp',
    ].join('\t');
    for (const s of rows) {
        xls += `\n${[
            s.id,
            typeOfRequest[s.requestType],
            s.searchCriteria ? s.searchCriteria.trim() : '',
            s.clientId == 'fsd-telesales-agent' ? 'Telesaler' : s.clientId == 'fsd-android-app1' ? 'Mobile app user' : '-',
            s.partenerName,
            s.userMarca,
            s.userFullName,
            moment(s.createdAt).format('DD.MM.YYYY HH:mm:ss'),
        ].join('\t')}`;
    }

    return xls;
};


module.exports = {
    getDefaultReport,
};

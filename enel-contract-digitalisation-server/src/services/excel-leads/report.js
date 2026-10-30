const getDefaultReport = async (app, leads) => {
    let xls = [
        'ENELTEL',
        'Note',
    ].join('\t');

    for (const l of leads) {
        xls += `\n${[
            l.place ? l.place.eneltel || "" : "",
            "",
        ].join('\t')}`;
    }

    return xls;
}

module.exports = {
    getDefaultReport,
};
const node_xj = require('xls-to-json');

const XLStoJSON = (source, dest) => {
    return new Promise((resolve, reject) => {
        node_xj({
            input: source,
            output: dest
        }, (err, result) => {
            if (err)
                return reject(err);
            return resolve(result);
        });
    });
};

XLStoJSON('incident.xlsx', 'incident.json');
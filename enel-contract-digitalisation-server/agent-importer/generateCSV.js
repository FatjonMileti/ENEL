const crypto = require('crypto');
const incidents = require('./incident.json');
const moment = require('moment');
const fs = require('fs');

const writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err, res) => {
            if (err)
                return reject(err);

            return resolve(res);
        });
    });
};

(async () => {
    let output = '';

    output += `crosid\tsessionid\tstatus\tagent\tnume\tprenume\tsecret\tlink\n`;
    for (let incident of incidents) {
        output += `${incident.ID_CROS}\t${incident.SessionID}\t${incident.Status}\t${incident.AgentID}\t${incident.Nume}\t${incident.Prenume}\t${incident.Secret}\thttp://eeasyapp1.enelint.global:3000/landing/${crypto.createHmac('sha256', incident.Secret).update(incident.SessionID).digest('hex')}/${incident.SessionID}?type=EE\n`;
    }

    await writeFile('./incident.csv', output);
})();

require('dotenv').config();
const stompit = require('stompit');

const options = {
  connectOptions: {
    host: process.env.STOMP_HOST,
    port: process.env.STOMP_PORT,
    ssl: process.env.STOMP_SSL === 'true' ? true : false,
    connectHeaders: {
      host: '/',
      login: process.env.STOMP_USER,
      passcode: process.env.STOMP_PASS,
      'heart-beat': '0,0'
    }
  },
  subscribeHeaders: {
    destination: '/queue/test',
    ack: 'client-individual'
  },
  sendHeaders: {
    destination: '/queue/test',
    'content-type': 'text/plain'
  }
};

class Stomp {
  constructor(props) {
    this.options = props || options;
    this.client = {};
  }

  connect() {
    this.client = new Promise((resolve, reject) => {
      stompit.connect(this.options.connectOptions, (err, client) => {
        if (err) {
          reject(err);
        }

        resolve(client);
      });
    });
  }

  read(cb) {
    return this.client.then((client) => {
      client.subscribe(this.options.subscribeHeaders, (err, message) => {
        if (err) {
          cb(err, '');
        }

        setTimeout(() => {
          message.readString('utf-8', (err, body) => {
            if (err) {
              cb(err, '');
            }

            client.ack(message);
            cb('', body);
          });
        }, parseInt(process.env.STOMP_READ_WAIT, 10));
      });
    });
  }

  write(dossierID, time, retry, sessionID, jwt, type, env) {
    return this.client.then((client) => {
      const frame = client.send(this.options.sendHeaders);

      if (typeof retry === 'undefined') {
        retry = 0;
      }

      frame.write(JSON.stringify({ DossierID: dossierID, time, retry, sessionID, jwt, type }));
      frame.end();
    });
  }

  disconnect() {
    this.client.then(client => {
      client.disconnect();
    });
  }
}

module.exports = Stomp;

var parser = require('xml2js').parseString;

module.exports = async xml => {
  return new Promise((resolve, reject) => {
    parser(xml, (err, result) => {
      if (err)
        return reject(err);

      return resolve(result);
    });
  });
};
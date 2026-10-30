const fs = require('fs');

const mkdir = (path) => {
    return new Promise((resolve) => {
        fs.mkdir(path, () => {
            return resolve();
        });
    });
};

const readFile = (path, type) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, type, (err, data) => {
            if (err)
                return reject(err);

            return resolve(data);
        });
    });
};

const writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err, res) => {
            if (err)
                return reject(err);

            return resolve(res);
        });
    });
};

const deleteFile = path => {
    return new Promise((resolve) => {
        fs.unlink(path, () => {

            return resolve();
        });
    });
};

const saveFile = (file, path) => {
    return new Promise((resolve, reject) => {
        file.mv(path, err => {
            if (err)
                return reject(err);

            return resolve();
        });
    });
};

const getFiles = (folder) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folder, (err, files) => {
            if (err) {
                return reject(err);
            };
            files = files.filter(file => fs.existsSync(`${folder}/${file}`) && fs.lstatSync(`${folder}/${file}`).isFile())
            return resolve(files);
        })
    })
}

module.exports = {
    mkdir,
    getFiles,
    readFile,
    writeFile,
    deleteFile,
    saveFile,
};
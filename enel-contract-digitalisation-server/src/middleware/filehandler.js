module.exports = function () {
  return function filehandler(req, res, next) {
    req.feathers.files = req.files;
    next();
  };
};

const logger = require('../logger');

module.exports = function (error, req, res, next) {
  logger.error(error.message, error);
  res.status(500).send('Something failed on the server.');
};

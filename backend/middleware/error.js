const logger = require('../logger');

module.exports = function (error, req, res, next) {
  logger.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    status: error.status || 500,
    user: req.user ? { id: req.user._id, role: req.user.role } : null,
    body: req.body,
    params: req.params,
    query: req.query,
  });
  res.status(500).send('Something failed on the server.');
};

const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader)
    return res.status(401).send('Access denied. No token provided');

  const token = authHeader.replace('Bearer ', '');

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedPayload;
    next();
  } catch (ex) {
    return res.status(401).send('Invalid or expired token');
  }
}

module.exports = auth;

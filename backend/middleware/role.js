module.exports = function allowedRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send('Access denied. No user found.');

    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access denied. You do not have permission.');
    }

    next();
  };
};

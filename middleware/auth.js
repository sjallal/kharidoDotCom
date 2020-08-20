// Defining our own custom middleware to authenticate users for private routes.
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get the token from header
  const token = req.header('x-auth-token'); //"x-auth-token"-> the header key.
  // check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authrization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

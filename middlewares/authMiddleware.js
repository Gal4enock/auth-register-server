const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      res.status(403).json({message: "User is unathorised"})
    }

    const data = jwt.verify(token, secret);
    req.user = data;
    next();
  } catch (err) {
    res.status(403).json({message: "User is unathorised"})
  }
}
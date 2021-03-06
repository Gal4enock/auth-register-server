const jwt = require('jsonwebtoken');
const { secret } = require('../assets/config');
const HttpCodes = require('../assets/constants');

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      res.status(HttpCodes.NOT_AUTORIZED).json({message: "User is unathorised"})
    }

    const data = jwt.verify(token, secret);
    req.user = data;
    next();
  } catch (err) {
    res.status(HttpCodes.NOT_AUTORIZED).json({message: "User is unathorised"})
  }
}
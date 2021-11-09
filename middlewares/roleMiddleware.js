const jwt = require('jsonwebtoken');
const { secret } = require('../assets/config');
const HttpCodes = require('../assets/constants');

module.exports = function (roles) {
  return function (req, res, next) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(HttpCodes.NOT_AUTORIZED).json({message: 'You are not authorised'})
      }

      const { roles: userRoles } = jwt.verify(token, secret);

      let hasRoles = false;
      if (userRoles.value === roles) {
          hasRoles = true;
        }
      
      if (!hasRoles) {
        res.status(HttpCodes.NOT_AUTORIZED).json({message: 'Access denied'})
      }
      next();
    } catch (err) {
      console.log(err);
      res.status(HttpCodes.NOT_AUTORIZED).json({message: 'You are not authorised'})
    }
  }
}
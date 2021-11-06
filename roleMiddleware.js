const jwt = require('jsonwebtoken');
const { secret } = require('./config');

module.exports = function (roles) {
  return function (req, res, next) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(403).json({message: 'You are not authorised'})
      }

      const { roles: userRoles } = jwt.verify(token, secret);

      let hasRoles = false;
      userRoles.forEach(role => {
        if (roles.includes(role.value)) {
          hasRoles = true;
        }
      })
      if (!hasRoles) {
        res.status(403).json({message: 'Access denied'})
      }
      next();
    } catch (err) {
      res.status(403).json({message: 'You are not authorised'})
    }
  }
}
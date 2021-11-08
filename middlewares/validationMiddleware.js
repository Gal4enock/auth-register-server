const { check } = require('express-validator');

module.exports = function validation() {
  return [
    check('username', 'username is required field').notEmpty(),
    check('password', 'password has to be longer then 3 symbols').isLength({ min: 3 })
  ]
};
const Router = require('express');
const { check } = require('express-validator');
const authController = require('./authController');

const router = new Router();

router.post('/registration', [
  check('username', 'username is required field').notEmpty(),
  check('password', 'password has to be longer then 3 symbols').isLength({min: 3})
], authController.registration);
router.post('/login', authController.login);
router.get('/users', authController.getUsers);

module.exports = router;
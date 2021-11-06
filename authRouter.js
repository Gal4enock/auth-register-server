const Router = require('express');
const { check } = require('express-validator');
const authController = require('./authController');
const authMiddleware = require('./authMiddleware');

const router = new Router();

router.post('/admin_registration', [
  check('username', 'username is required field').notEmpty(),
  check('password', 'password has to be longer then 3 symbols').isLength({min: 3})
], authController.registrationAdmin );
router.post('/boss_registration', [
  check('username', 'username is required field').notEmpty(),
  check('password', 'password has to be longer then 3 symbols').isLength({min: 3})
], authController.registrationBoss );
router.post('/user_registration', [
  check('username', 'username is required field').notEmpty(),
  check('password', 'password has to be longer then 3 symbols').isLength({min: 3})
], authController.registrationUser);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getUsers);

module.exports = router;
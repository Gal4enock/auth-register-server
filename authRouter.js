const Router = require('express');
const validation = require('./middlewares/validationMiddleware');
const authController = require('./authController');
const authMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');

const router = new Router();

router.post('/admin_registration', validation(), authController.registrationAdmin );
router.post('/boss_registration', validation(), authController.registrationBoss );
router.post('/user_registration', validation(), authController.registrationUser);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getUsers);
router.patch('/users',authMiddleware, roleMiddleware('BOSS'), authController.changeBoss);

module.exports = router;
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.use(authController.protectRoute);

router
    .route('/profile')
    .get(userController.getProfile)
    .put(userController.updateProfile);

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .delete(userController.deleteUser)

router.put('/:id/role', authController.restrictTo('admin'),
    userController.changeRole);

module.exports = router;
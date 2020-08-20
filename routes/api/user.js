var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

const {
  signup,
  getUserById,
  getUser,
  updateUser,
} = require('../../controllers/user');

// Sign up route.
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please insert a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  signup
);

// Getting user through parameter middleware.
router.param('userId', getUserById);

// Get user by ID.
router.get('/:userId', getUser);

// Update user by ID.
router.put(
  '/:userId',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  updateUser
);

module.exports = router;

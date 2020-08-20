var express = require('express');
var router = express.Router();
const { check } = require('express-validator');
const { loadUser, signin } = require('../../controllers/auth');
const auth = require('../../middleware/auth');

// Load user
router.get('/', auth, loadUser);

// SignIn user
router.post(
  '/',
  [
    check('email', 'email is required').isEmail(),
    check('password', 'password field is required').isLength({ min: 1 }),
  ],
  signin
);

module.exports = router;

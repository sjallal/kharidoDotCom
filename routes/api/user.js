var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

const { signup } = require('../../controllers/user');

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
module.exports = router;

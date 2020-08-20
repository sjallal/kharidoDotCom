const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Require the user model to check into the db.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route:   POST api/users
// @desc:    Register user.
// @access:  Public(Won't require any token to access this route)

exports.signup = async (req, res) => {
  // console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, lastname, email, password, userinfo } = req.body;
  // const { email } = req.body;

  try {
    // See if the user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Here it just creates an instance and doesn't saves to the database.
    // user = new User(req.body);
    user = new User({
      name,
      lastname,
      email,
      password,
      userinfo,
    });
    // Inorder to save it we use user.save().

    // Encrypt the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    // Hashing..
    user.password = await bcrypt.hash(user.password, salt);
    await user.save(); // Writing into the database.

    // Return jsonwebtoken
    //(because in the front end I want the user to get logged in right away when he registers).
    // res.send("User registered!");
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    // If something is wrong then that's definetly gonna be a server error.
    console.log(err);
    res.status(500).send('server error');
  }
};

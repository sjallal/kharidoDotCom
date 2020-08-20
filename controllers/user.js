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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, lastname, email, password, userinfo } = req.body;

  try {
    // See if the user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    user = new User({
      name,
      lastname,
      email,
      password,
      userinfo,
    });

    // Encrypt the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    // Hashing..
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // Return jsonwebtoken(because in the front end I want the user to get logged in right away when he registers).
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
    console.log(err);
    res.status(500).send('server error');
  }
};

exports.getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ msg: 'User not found here.' });
    req.user = user;
    next();
  } catch (error) {
    console.error(error.message);
    if (error.kind == 'ObjectId')
      return res.status(400).json({ msg: 'User not found.' });
    res.status(500).send('Server Error');
  }
};

exports.getUser = (req, res) => {
  req.user.password = undefined;
  return res.json(req.user);
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, lastname, email, userinfo } = req.body;

  const newUser = {
    name,
    email,
  };
  if (lastname) newUser.lastname = lastname;
  if (userinfo) newUser.userinfo = userinfo;

  try {
    let user = await User.findOne({ _id: req.user.id });
    if (user) {
      // Update
      user = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: newUser },
        { new: true }
      );
      return res.json(user);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
};

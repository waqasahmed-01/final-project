const auth = require('../middleware/auth');
const { User, validate } = require('../models/user');
const lodash = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    // Create new user
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'donor',
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    // Save to DB
    await user.save();

    const userResponse = lodash.pick(user, ['_id', 'name', 'email', 'role']);
    const token = user.generateAuthToken();

    res
      .status(201)
      .header('x-auth-token', token)
      .json({ result: true, data: userResponse });
  } catch (ex) {
    res.status(500).send('Something failed while registering the user.');
  }
});

module.exports = router;

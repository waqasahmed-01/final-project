const auth = require('../middleware/auth');
const { User, validate } = require('../models/user');
const lodash = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
  } catch (execption) {
    next(execption);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'donor',
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const userResponse = lodash.pick(user, ['_id', 'name', 'email', 'role']);
    const token = user.generateAuthToken();

    res
      .status(201)
      .header('x-auth-token', token)
      .json({ result: true, data: userResponse });
  } catch (execption) {
    next(execption);
  }
});

module.exports = router;

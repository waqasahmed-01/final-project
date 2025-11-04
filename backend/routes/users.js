const auth = require('../middleware/auth');
const { User, validate } = require('../models/user');
const lodash = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
  } catch (exception) {
    next(exception);
  }
});

//  Register new user (Donor or NGO)
router.post('/', async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Prevent manual admin registration
    if (req.body.role === 'admin')
      return res.status(403).send('You cannot self-register as an admin.');

    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    // Auto-approval logic: NGOs need admin approval
    const isApproved = req.body.role === 'ngo' ? false : true;

    // Create user object (password will be hashed later)
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'donor',
      isApproved, // added here
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    // Prepare response data
    const userResponse = lodash.pick(user, [
      '_id',
      'name',
      'email',
      'role',
      'isApproved',
    ]);
    const token = user.generateAuthToken();

    // Custom message based on role
    const message =
      user.role === 'ngo'
        ? 'NGO registered successfully. Awaiting admin approval.'
        : 'User registered successfully.';

    // Send response
    res
      .status(201)
      .header('x-auth-token', token)
      .json({ result: true, message, data: userResponse });
  } catch (exception) {
    next(exception);
  }
});

module.exports = router;

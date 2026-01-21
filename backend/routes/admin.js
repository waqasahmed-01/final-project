const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Donation } = require('../models/Donation');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ADMIN STATS
router.get('/stats', [auth, admin], async (req, res, next) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNgos = await User.countDocuments({ role: 'ngo' });
    const totalDonations = await Donation.countDocuments();

    res.status(200).json({
      totalDonors,
      totalNgos,
      totalDonations,
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL USERS
router.get('/users', [auth, admin], async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// GET ALL DONATIONS
router.get('/donations', [auth, admin], async (req, res, next) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email phoneNumber')
      .populate('ngo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Donation } = require('../models/Donation');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/stats', [auth, admin], async (req, res, next) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNgos = await User.countDocuments({
      role: 'ngo',
      isApproved: true,
    });
    const pendingNgos = await User.countDocuments({
      role: 'ngo',
      isApproved: false,
    });
    const totalDonations = await Donation.countDocuments();

    res.status(200).json({
      totalDonors,
      totalNgos,
      pendingNgos,
      totalDonations,
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL NGOs WAITING FOR APPROVAL
router.get('/ngos/pending', [auth, admin], async (req, res, next) => {
  try {
    const pendingNgos = await User.find({
      role: 'ngo',
      isApproved: false,
    }).select('-password');

    res.status(200).json(pendingNgos);
  } catch (err) {
    next(err);
  }
});

// APPROVE NGO BY ID
router.put('/ngos/approve/:id', [auth, admin], async (req, res, next) => {
  try {
    const ngo = await User.findById(req.params.id);

    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found.' });
    }

    ngo.isApproved = true;
    await ngo.save();

    res.status(200).json({
      message: 'NGO approved successfully.',
      ngo,
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL USERS (DONORS + NGOS)
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

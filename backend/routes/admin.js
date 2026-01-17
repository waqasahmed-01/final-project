const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // You should already have this middleware

// Get all NGOs waiting for approval
router.get('/ngos/pending', [auth, admin], async (req, res) => {
  const pendingNgos = await User.find({
    role: 'ngo',
    isApproved: false,
  }).select('-password');
  res.send(pendingNgos);
});

// Approve a specific NGO by ID
router.put('/ngos/approve/:id', [auth, admin], async (req, res) => {
  const ngo = await User.findById(req.params.id);
  if (!ngo || ngo.role !== 'ngo') return res.status(404).send('NGO not found.');

  ngo.isApproved = true;
  await ngo.save();

  res.send({ message: 'NGO approved successfully.', ngo });
});

module.exports = router;

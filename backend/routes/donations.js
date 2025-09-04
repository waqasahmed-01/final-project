const express = require('express');
const router = express.Router();
const { Donation, validateDonation } = require('../models/Donation');
const auth = require('../middleware/auth');

// Donor: Create Donation
router.post('/', auth, async (req, res) => {
  // Only donors can create donations
  if (req.user.role !== 'donor')
    return res
      .status(403)
      .send('Access denied. Only donors can create donations.');

  // Validate request body
  const { error } = validateDonation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let donation = new Donation({
    donor: req.user._id, // donor is from logged-in user
    foodType: req.body.foodType,
    quantity: req.body.quantity,
    description: req.body.description,
    status: 'pending',
  });

  donation = await donation.save();

  res.status(201).json({
    result: true,
    message: 'Donation created successfully.',
    data: donation,
  });
});

module.exports = router;

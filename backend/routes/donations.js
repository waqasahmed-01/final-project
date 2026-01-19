const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Donation, validateDonation } = require('../models/Donation');
const auth = require('../middleware/auth'); // verifies JWT
const authorize = require('../middleware/role'); // checks user role (donor, ngo, etc.)

router.get('/', auth, authorize('admin'), async (req, res, next) => {
  try {
    const donations = await Donation.find()
      .populate('donor', '-password -__v')
      .populate('ngo', '-password -__v')
      .sort({ createdAt: -1 });

    res.send(donations);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/my-donations',
  auth,
  authorize('donor'),
  async (req, res, next) => {
    try {
      const donations = await Donation.find({ donor: req.user._id })
        .populate('ngo', 'name email') // only show NGO name and email
        .sort({ createdAt: -1 });

      res.send(donations);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/pending', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const pendingDonations = await Donation.find({ status: 'pending' })
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(pendingDonations);
  } catch (err) {
    next(err);
  }
});

//Accept and reject flow.
router.patch('/:id/status', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).send('Invalid status');
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status, ngo: req.user._id },
      { new: true },
    );

    if (!donation) {
      return res.status(404).send('Donation not found');
    }

    res.status(200).json({
      message: `Donation ${status}`,
      donation,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, authorize('donor'), async (req, res, next) => {
  try {
    // 1. Validate request body
    const { error } = validateDonation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!req.body) {
      return res.status(400).send('Request body can not be empty');
    }

    const {
      foodName,
      foodType,
      quantity,
      location,
      phoneNumber,
      description,
      isFree,
      price,
      foodImage, // optional
    } = req.body;

    // 2. Create donation
    const donation = new Donation({
      foodName,
      foodType,
      quantity,
      location,
      phoneNumber,
      description,
      isFree,
      price: isFree ? 0 : price,
      foodImage: foodImage || null,
      donor: req.user._id,
      status: 'pending',
    });

    // 3. Save donation
    await donation.save();

    // 4. Populate for response
    const populatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('ngo', 'name email');

    // 5. Send response
    res.status(201).send({
      message: 'Donation created successfully!',
      donation: populatedDonation,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/accept', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const donationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(donationId))
      return res.status(400).send('Invalid donation ID.');

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).send('Donation not found.');
    if (donation.status !== 'pending')
      return res.status(400).send('Donation is already processed.');

    donation.status = 'accepted';
    donation.ngo = req.user._id;
    await donation.save();

    const updatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('ngo', 'name email');

    res.send({
      message: 'Donation accepted successfully.',
      donation: updatedDonation,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/reject', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const donationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(donationId))
      return res.status(400).send('Invalid donation ID.');

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).send('Donation not found.');
    if (donation.status !== 'pending')
      return res.status(400).send('Donation is already processed.');

    donation.status = 'rejected';
    await donation.save();

    const updatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('ngo', 'name email');

    res.send({
      message: 'Donation rejected successfully.',
      donation: updatedDonation,
    });
  } catch (err) {
    next(err);
  }
});

// GET donations accepted/rejected by logged-in NGO
router.get('/ngo/my', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const donations = await Donation.find({
      ngo: req.user._id,
      status: { $in: ['accepted', 'rejected'] },
    })
      .populate('donor', 'name email phoneNumber')
      .sort({ updatedAt: -1 });

    res.status(200).send(donations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

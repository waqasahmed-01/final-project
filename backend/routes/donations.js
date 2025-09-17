const { Donation, validateDonation } = require('../models/Donation');
const {
  Notification,
  validateNotification,
} = require('../models/Notification');
const { User } = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const express = require('express');
const router = express.Router();
const { default: mongoose } = require('mongoose');

//Admin: view donations.
router.get('/', auth, authorize('admin'), async function (req, res, next) {
  try {
    const donations = await Donation.find()
      .populate('donor', '-_id name email')
      .populate('ngo', '-_id name email');

    res.send(donations);
  } catch (exception) {
    next(exception);
  }
});

//Donor view own donations.
router.get(
  '/my-donations',
  auth,
  authorize('donor'),
  async function (req, res, next) {
    try {
      const donations = await Donation.find({ donor: req.user._id })
        .populate('donor', '-_id name email')
        .populate('ngo', '-_id name email');

      if (!donations || donations.length === 0) {
        return res
          .status(404)
          .send('No donations have been created by the user.');
      }
      res.send(donations);
    } catch (exception) {
      next(exception);
    }
  }
);

// Donor: Create Donation - only donors can post.
router.post('/', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'donor')
      return res
        .status(403)
        .send('Access denied. Only donors can create donations.');

    // Validate request body
    const { error } = validateDonation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let donation = new Donation({
      donor: req.user._id, // donor is from logged-in user
      foodName: req.body.foodName,
      foodType: req.body.foodType,
      quantity: req.body.quantity,
      location: req.body.location,
      status: 'pending',
    });

    donation = await donation.save(); //saving.

    //Get Ngo.
    const ngos = await User.find({ role: 'ngo' });

    const notifications = ngos.map((ngo) => ({
      sender: req.user._id,
      receiver: ngo._id,
      donation: donation._id,
      type: 'donation',
      message: `New donation posted by ${req.user._id}.`,
    }));
    //Notifications for NGOs
    await Notification.insertMany(notifications);

    res.status(201).json({
      result: true,
      message: 'Donation created successfully.',
      data: donation,
    });
  } catch (exception) {
    next(exception);
  }
});

//NGO Accepts Donations.
router.put(
  '/:id/accept',
  auth,
  authorize('ngo'),
  async function (req, res, next) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).send('Invalid ID.');
      const donation = await Donation.findById(id);
      if (!donation) return res.status(404).send('Donation not found.');
      if (donation.status !== 'pending')
        return res.status(400).send('Donation already processed.');

      donation.status = 'accepted';
      donation.ngo = req.user._id;
      await donation.save();

      //Notification for donor about donation's acceptance.
      await Notification.create({
        user: donation.donor,
        message: `Your donation "${donation.foodName}" has been accepted. Transport on the way`,
        donation: donation._id,
      });

      res.send(donation);
    } catch (exception) {
      next(exception);
    }
  }
);

// NGO Reject Donation
router.put('/:id/reject', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send('Invalid ID.');
    const donation = await Donation.findById(id);
    if (!donation) return res.status(404).send('Donation not found.');
    if (donation.status !== 'pending')
      return res.status(400).send('Donation already processed.');

    donation.status = 'rejected';
    donation.ngo = req.user._id;
    await donation.save();

    // Notify donor
    await Notification.create({
      user: donation.donor,
      role: 'donor',
      message: `Your donation "${donation.foodName}" was rejected by an "${req.user.name}".`,
      donation: donation._id,
    });

    res.send(donation);
  } catch (exception) {
    next(exception);
  }
});

// NGO: View accepted donations.
router.get('/my-accepted', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const donations = await Donation.find({
      ngo: req.user._id,
      status: 'accepted',
    })
      .populate('donor', '-_id name email')
      .populate('ngo', '-_id name');
    res.send(donations);
  } catch (exception) {
    next(exception);
  }
});

// NGO: View pending donations (not yet accepted)
router.get('/pending', auth, authorize('ngo'), async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: 'pending' }).populate(
      'donor',
      'name email'
    );
    res.send(donations);
  } catch (exception) {
    next(exception);
  }
});

module.exports = router;

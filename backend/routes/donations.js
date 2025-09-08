const express = require('express');
const router = express.Router();
const { Donation, validateDonation } = require('../models/Donation');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

//Admin: view donations.
router.get('/', auth, authorize('admin'), async function (req, res) {
  const donations = await Donation.find()
    .populate('donor', '-_id name email')
    .populate('ngo', '-_id name email');

  res.send(donations);
});

//Donor view own donations.
router.get(
  '/my-donations',
  auth,
  authorize('donor'),
  async function (req, res) {
    {
      const donations = await Donation.find({ donor: req.user._id })
        .populate('donor', '-_id name email')
        .populate('ngo', '-_id name email');
    }
  }
);

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
    foodName: req.body.foodName,
    foodType: req.body.foodType,
    quantity: req.body.quantity,
    location: req.body.location,
    status: 'pending',
  });

  donation = await donation.save(); //saving.

  //Getting name and email of donor using populate in response.
  donation = await donation.populate('donor', '-_id name email');

  res.status(201).json({
    result: true,
    message: 'Donation created successfully.',
    data: donation,
  });
});

//NGO Accepts Donations.
router.put('/:id/accept', auth, authorize('ngo'), async function (req, res) {
  const id = req.params.id;
  const donation = await Donation.findById(id);
  if (!donation) return res.status(404).send('Donation not found.');
  if (donation.status !== 'pending')
    return res.status(400).send('Donation already processed.');

  donation.status = 'accepted';
  donation.ngo = req.user._id;
  await donation.save();

  res.send(donation);
});

module.exports = router;

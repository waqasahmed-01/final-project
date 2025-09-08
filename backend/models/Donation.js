const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

//Donation Schema.
const donationSchema = new mongoose.Schema({
  foodName: {
    type: String,
    require: true,
    trim: true,
  },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged'],
    required: true,
  },
  quantity: {
    type: String, // Example: "5 kg", "10 meals"
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked-up', 'completed', 'rejected'],
    default: 'pending',
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // NGO will also be from User collection
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Joi Validation.
function validateDonation(donation) {
  const schema = Joi.object({
    foodName: Joi.string().min(3).max(255).required(),
    foodType: Joi.string().valid('cooked', 'raw', 'packaged').required(),
    quantity: Joi.string().min(1).max(50).required(),
    location: Joi.string().min(3).max(255).required(),
    status: Joi.string().valid(
      'pending',
      'accepted',
      'picked-up',
      'completed',
      'rejected'
    ),
    donor: Joi.objectId().required(),
    ngo: Joi.objectId().allow(null),
  });

  return schema.validate(donation);
}

const Donation = mongoose.model('Donation', donationSchema);

module.exports = { Donation, validateDonation };

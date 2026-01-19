// backend/models/Donation.js
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// Donation Schema.
const donationSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
    trim: true,
  },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged'],
    required: true,
  },
  quantity: {
    type: String,
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
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  isFree: {
    type: Boolean,
    required: true,
    default: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  foodImage: {
    type: String,
    default: null, // optional image
  },
});

function validateDonation(donation) {
  const schema = Joi.object({
    foodName: Joi.string().min(3).max(255).required(),
    foodType: Joi.string().valid('cooked', 'raw', 'packaged').required(),
    quantity: Joi.alternatives()
      .try(Joi.string().min(1).max(50), Joi.number().min(1))
      .required(),
    location: Joi.string().min(3).max(255).required(),
    phoneNumber: Joi.string()
      .pattern(/^[0-9+\-\s]{10,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid phone number format',
      }),
    description: Joi.string().max(500).allow('').optional(),
    isFree: Joi.boolean().required(),
    price: Joi.number()
      .min(0)
      .when('isFree', {
        is: false,
        then: Joi.number().greater(0).required(),
        otherwise: Joi.number().optional(),
      }),
    foodImage: Joi.string().allow(null, '').optional(),
    status: Joi.string()
      .valid('pending', 'accepted', 'picked-up', 'completed', 'rejected')
      .optional(),
    ngo: Joi.objectId().allow(null).optional(),
    donor: Joi.objectId().optional(),
  });

  return schema.validate(donation);
}

const Donation =
  mongoose.models.Donation || mongoose.model('Donation', donationSchema);

module.exports = { Donation, validateDonation };

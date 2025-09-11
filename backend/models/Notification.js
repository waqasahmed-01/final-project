const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // donor or NGO

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // NGO or donor

  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  }, // linked donation

  message: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 500,
  },

  type: {
    type: String,
    enum: ['donation', 'status'],
    required: true,
  }, // "donation" = donor → NGO, "status" = NGO → donor

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'resolved', 'read'],
    default: 'pending',
  },
  // "pending"   → waiting for NGO action
  // "accepted"  → NGO accepted donation
  // "rejected"  → NGO rejected donation
  // "resolved"  → other NGOs’ notifications auto-closed when one accepts
  // "read"      → notification seen

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Joi validation
function validateNotification(notification) {
  const schema = Joi.object({
    sender: Joi.objectId().required(),
    receiver: Joi.objectId().required(),
    donation: Joi.objectId().required(),
    message: Joi.string().min(3).max(500).required(),
    type: Joi.string().valid('donation', 'status').required(),
    status: Joi.string().valid(
      'pending',
      'accepted',
      'rejected',
      'resolved',
      'read'
    ),
  });
  return schema.validate(notification);
}

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, validateNotification };

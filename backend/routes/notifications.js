// routes/notifications.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const { Notification } = require('../models/Notification');
const { User } = require('../models/User');
// Get all notifications for the logged-in user
router.get('/', auth, async (req, res, next) => {
  try {
    // const ngo = await User.find({ role: 'ngo' });
    const notifications = await Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('donation', 'foodName foodType');

    if (!notifications.length) {
      return res
        .status(200)
        .send({ message: 'No notifications found', notifications: [] });
    }

    res.send(notifications);
  } catch (exception) {
    next(exception);
  }
});

// Mark a notification as read
router.put('/:id/read', auth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid notification ID.');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, receiver: req.user._id, status: { $ne: 'resolved' } },
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).send('Notification not found.');
    }

    res.send(notification);
  } catch (exception) {
    next(exception);
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid notification ID.');
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      receiver: req.user._id,
    });

    if (!notification) {
      return res.status(404).send('Notification not found.');
    }

    res.send({ message: 'Notification deleted successfully.' });
  } catch (exception) {
    next(exception);
  }
});

module.exports = router;

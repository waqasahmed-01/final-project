const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

router.post('/', async function (req, res) {
  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .json({ success: false, message: 'Invalid email or password' });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res
      .status(400)
      .json({ success: false, message: 'Invalid email or password' });

  const token = user.generateAuthToken();
  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token: token,
  });
});

//Validating credentials.
function validate(req) {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(req);
}

module.exports = router;

const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  role: {
    type: String,
    enum: ['donor', 'ngo', 'admin'],
    default: 'donor',
    required: true,
  },
});

//Authentication Token.
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_SECRET
  );

  return token;
};

//Model.
const User = mongoose.model('User', userSchema);

//Validations.
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(5).max(1024).required(),
    role: Joi.string().valid('donor', 'ngo', 'admin'),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;

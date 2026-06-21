// src/models/signUpModel.js
const mongoose = require('mongoose');

const SignUpSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  profilePicture: String, // Add the profilePicture field
  createdAt: { type: Date, default: Date.now }
});

const SignUp = mongoose.model('SignUp', SignUpSchema);

module.exports = SignUp;

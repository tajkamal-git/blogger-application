
// src/models/loginDataModel.js
const mongoose = require('mongoose');

const LoginDataSchema = new mongoose.Schema({
  email: String,
  password: String,
  loginDateTime: { type: Date, default: Date.now }
});

const LoginData = mongoose.model('LoginData', LoginDataSchema);



module.exports = LoginData;

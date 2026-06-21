// src/controllers/auth/signupController.js
const SignUp = require('../../models/signUpModel');

const signupController = async (req, res) => {
  try {
    const { fullName, email, password, profilePicture } = req.body;
    const existingUser = await SignUp.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already taken' });
    }

    const signup = new SignUp({ fullName, email, password, profilePicture });
    await signup.save();
    res.status(201).json({ success: true, message: 'User registration successful' });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = signupController;

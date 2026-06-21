// src/controllers/auth/loginController.js
const SignUp = require('../../models/signUpModel');
const LoginData = require('../../models/loginDataModel');

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await SignUp.findOne({ email, password });

    if (user) {
      // If user is found with the provided email and password
      const loginData = new LoginData({ email, password });
      await loginData.save();
      res.status(200).json({ success: true, user, message: 'Login successful' });
    } else {
      // If no user is found with the provided credentials
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error checking login credentials:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = loginController;

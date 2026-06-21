// src/controllers/auth/checkEmailController.js
const SignUp = require('../../models/signUpModel');

const checkEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await SignUp.exists({ Email: email });
    res.json({ exists: userExists });
  } catch (error) {
    console.error('Error checking email existence:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = checkEmailController;

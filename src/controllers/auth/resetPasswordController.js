// src/controllers/auth/resetPasswordController.js
const SignUp = require('../../models/signUpModel');

const resetPasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const updatedUser = await SignUp.findOneAndUpdate({ Email: email }, { password: newPassword }, { new: true });

    if (updatedUser) {
      res.json({ success: true, message: 'Password reset successful' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = resetPasswordController;

// controllers/auth/updateEmailController.js
const SignUp = require('../../models/signUpModel');

const updateEmail = async (req, res) => {
  const { email, newEmail } = req.body;

  try {
    const updatedUser = await SignUp.findOneAndUpdate(
      { email },
      { email: newEmail },
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Email updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = updateEmail;

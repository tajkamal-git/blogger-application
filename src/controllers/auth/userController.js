// controllers/auth/userController.js
const SignUp = require('../../models/signUpModel');

const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await SignUp.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Include profilePicture in the userDetails
    const userDetails = {
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    res.status(200).json(userDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getUserByEmail };

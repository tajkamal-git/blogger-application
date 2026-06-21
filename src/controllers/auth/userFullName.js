const SignUp = require('../../models/signUpModel');

const getUserFullName = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await SignUp.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Include fullName in the userFullName
    const userFullName = {
      fullName: user.fullName,
    };

    res.status(200).json(userFullName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getUserFullName };

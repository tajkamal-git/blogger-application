// update-profile.js

const SignUp = require('../../models/signUpModel'); // Corrected import statement

const updateProfilePicture = async (req, res) => {
    const { email, profilePicture } = req.body;

    try {
        // Find the user by email and update the profile picture
        const updatedUser = await SignUp.findOneAndUpdate({ email }, { profilePicture }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Profile picture updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = updateProfilePicture;

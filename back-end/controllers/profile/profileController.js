import User from '../../models/userModel.js';

// Get current user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data without sensitive information
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            height: user.height,
            weight: user.weight,
            startingWeight: user.startingWeight,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            nutritionGoal: user.nutritionGoal,
            dietaryPreferences: user.dietaryPreferences,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const {
            name,
            height,
            weight,
            startingWeight,
            dateOfBirth,
            gender,
            dietaryPreferences
        } = req.body;

        // Find user and update
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {
                name,
                height,
                weight,
                startingWeight,
                dateOfBirth,
                gender,
                dietaryPreferences
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                height: updatedUser.height,
                weight: updatedUser.weight,
                startingWeight: updatedUser.startingWeight,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
                dietaryPreferences: updatedUser.dietaryPreferences
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: validationErrors });
        }
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};

// Update profile picture (upload handler would be middleware)
export const updateProfilePicture = async (req, res) => {
    try {
        // Assuming the file path is saved in req.file.path by multer middleware
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Ensure the path starts with a slash for consistent URL construction
        const profilePicturePath = '/' + req.file.path.replace(/\\/g, '/');

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { profilePicture: profilePicturePath },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile picture updated successfully',
            profilePicture: profilePicturePath
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
}; 
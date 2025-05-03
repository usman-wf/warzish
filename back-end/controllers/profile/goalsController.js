import User from '../../models/userModel.js';
import Goal from '../../models/goalModel.js';

// Get user goals
export const getUserGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.userId });

        res.status(200).json(goals);
    } catch (error) {
        console.error('Error fetching user goals:', error);
        res.status(500).json({ error: 'Failed to fetch user goals' });
    }
};

// Create a new goal
export const createGoal = async (req, res) => {
    try {
        const {
            goalType,
            targetWeight,
            targetBodyFatPercentage,
            timeframe
        } = req.body;

        // Validate required fields
        if (!goalType || !timeframe || (!targetWeight && !targetBodyFatPercentage)) {
            return res.status(400).json({ error: 'Missing required goal information' });
        }

        // Get current user data for starting points
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create new goal
        const newGoal = new Goal({
            user: req.userId,
            goalType,
            startWeight: user.weight,
            targetWeight,
            targetBodyFatPercentage,
            startDate: new Date(),
            targetDate: new Date(Date.now() + timeframe * 30 * 24 * 60 * 60 * 1000), // Convert months to milliseconds
            timeframe, // in months
            isActive: true
        });

        await newGoal.save();

        res.status(201).json({
            message: 'Goal created successfully',
            goal: newGoal
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: validationErrors });
        }
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    try {
        const {
            goalType,
            targetWeight,
            targetBodyFatPercentage,
            timeframe,
            isActive
        } = req.body;

        const goalId = req.params.goalId;

        // Find goal and verify it belongs to the user
        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (goal.user.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update this goal' });
        }

        // Update goal
        if (goalType) goal.goalType = goalType;
        if (targetWeight) goal.targetWeight = targetWeight;
        if (targetBodyFatPercentage) goal.targetBodyFatPercentage = targetBodyFatPercentage;

        if (timeframe) {
            goal.timeframe = timeframe;
            // Recalculate target date based on start date and new timeframe
            goal.targetDate = new Date(goal.startDate.getTime() + timeframe * 30 * 24 * 60 * 60 * 1000);
        }

        if (isActive !== undefined) goal.isActive = isActive;

        await goal.save();

        res.status(200).json({
            message: 'Goal updated successfully',
            goal
        });
    } catch (error) {
        console.error('Error updating goal:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: validationErrors });
        }
        res.status(500).json({ error: 'Failed to update goal' });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const goalId = req.params.goalId;

        // Find goal and verify it belongs to the user
        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (goal.user.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this goal' });
        }

        await Goal.findByIdAndDelete(goalId);

        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};

// Track progress
export const updateProgress = async (req, res) => {
    try {
        const { weight, bodyFatPercentage, date } = req.body;
        const goalId = req.params.goalId;

        // Find goal and verify it belongs to the user
        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (goal.user.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update this goal progress' });
        }

        // Add new progress entry
        const progressEntry = {
            date: date || new Date(),
            weight,
            bodyFatPercentage
        };

        goal.progressEntries.push(progressEntry);
        await goal.save();

        // Update user's current weight if provided
        if (weight) {
            await User.findByIdAndUpdate(req.userId, { weight });
        }

        res.status(200).json({
            message: 'Progress updated successfully',
            progress: progressEntry
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
}; 
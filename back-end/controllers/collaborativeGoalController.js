import CollaborativeGoal from '../models/CollaborativeGoal.js';

// Create a new collaborative goal
export const createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      target,
      unit,
      startDate,
      endDate,
      participants
    } = req.body;

    const goal = new CollaborativeGoal({
      title,
      description,
      type,
      target,
      unit,
      startDate,
      endDate,
      createdBy: req.user._id,
      participants: [
        { user: req.user._id, status: 'accepted' },
        ...participants.map(p => ({ user: p, status: 'invited' }))
      ]
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's collaborative goals
export const getUserGoals = async (req, res) => {
  try {
    const goals = await CollaborativeGoal.find({
      'participants.user': req.user._id
    })
    .populate('createdBy', 'username profilePicture')
    .populate('participants.user', 'username profilePicture')
    .sort({ createdAt: -1 });

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update goal progress
export const updateProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress } = req.body;

    const goal = await CollaborativeGoal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const participantIndex = goal.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(403).json({ message: 'Not a participant in this goal' });
    }

    goal.participants[participantIndex].progress = progress;

    // Check if goal is completed
    if (progress >= goal.target) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update participant status (accept/decline invitation)
export const updateParticipantStatus = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { status } = req.body;

    const goal = await CollaborativeGoal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const participantIndex = goal.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(403).json({ message: 'Not invited to this goal' });
    }

    goal.participants[participantIndex].status = status;
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
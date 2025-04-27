import PropTypes from 'prop-types';

const WorkoutPlanForm = ({ 
  workoutPlan, 
  onPlanChange, 

  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Workout Plan Details</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={workoutPlan.name}
            onChange={(e) => onPlanChange('name', e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        {/* Rest of the form implementation remains the same */}
      </div>
    </form>
  );
};

WorkoutPlanForm.propTypes = {
  workoutPlan: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    difficulty: PropTypes.oneOf(['Beginner', 'Intermediate', 'Advanced']).isRequired,
    estimatedDuration: PropTypes.number.isRequired,
    isPublic: PropTypes.bool.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    exercises: PropTypes.arrayOf(
      PropTypes.shape({
        exerciseId: PropTypes.string.isRequired,
        sets: PropTypes.number.isRequired,
        reps: PropTypes.number.isRequired,
        duration: PropTypes.number,
        restPeriod: PropTypes.number.isRequired,
        notes: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  onPlanChange: PropTypes.func.isRequired,
  onExerciseChange: PropTypes.func.isRequired,
  onRemoveExercise: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default WorkoutPlanForm;
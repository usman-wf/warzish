import { useState } from 'react';
import PropTypes from 'prop-types';

const WorkoutPlanForm = ({ 
  workoutPlan, 
  onPlanChange,
  onExerciseChange,
  onRemoveExercise, 
  onSubmit 
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !workoutPlan.tags.includes(tagInput.trim())) {
      onPlanChange('tags', [...workoutPlan.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onPlanChange('tags', workoutPlan.tags.filter(tag => tag !== tagToRemove));
  };

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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={workoutPlan.description}
            onChange={(e) => onPlanChange('description', e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select
            value={workoutPlan.difficulty}
            onChange={(e) => onPlanChange('difficulty', e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (mins)</label>
          <input
            type="number"
            value={workoutPlan.estimatedDuration}
            onChange={(e) => onPlanChange('estimatedDuration', parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min="1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {workoutPlan.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="flex-1 border rounded-l px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-500 text-white px-3 py-2 rounded-r"
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={workoutPlan.isPublic}
            onChange={(e) => onPlanChange('isPublic', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
            Make this workout plan public
          </label>
        </div>
      </div>
      
      {workoutPlan.exercises.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Exercises</h3>
          <div className="space-y-4">
            {workoutPlan.exercises.map((exercise, index) => (
              <div key={index} className="border rounded p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Exercise {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => onRemoveExercise(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => onExerciseChange(index, 'sets', parseInt(e.target.value))}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => onExerciseChange(index, 'reps', parseInt(e.target.value))}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rest Period (seconds)
                    </label>
                    <input
                      type="number"
                      value={exercise.restPeriod}
                      onChange={(e) => onExerciseChange(index, 'restPeriod', parseInt(e.target.value))}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (optional, seconds)
                    </label>
                    <input
                      type="number"
                      value={exercise.duration || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        onExerciseChange(index, 'duration', value);
                      }}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={exercise.notes}
                    onChange={(e) => onExerciseChange(index, 'notes', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      >
        Save Workout Plan
      </button>
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
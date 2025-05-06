import { useState } from 'react';
import PropTypes from 'prop-types';
import '../screens/workout/WorkoutTheme.css';

const WorkoutPlanForm = ({ 
  workoutPlan, 
  onPlanChange,
  onExerciseChange,
  onRemoveExercise, 
  onSubmit,
  isEditing = false,
  onCancel
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
    <form onSubmit={onSubmit} className="workout-form-container">
      <div className="workout-form-group">
        <label htmlFor="name">Workout Name</label>
        <input
          type="text"
          id="name"
          value={workoutPlan.name}
          onChange={(e) => onPlanChange('name', e.target.value)}
          className="input"
          placeholder="e.g., Full Body Blast"
          required
        />
      </div>
      
      <div className="workout-form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={workoutPlan.description}
          onChange={(e) => onPlanChange('description', e.target.value)}
          className="input"
          placeholder="Describe your workout plan"
          rows="3"
        />
      </div>
      
      <div className="workout-form-group">
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={workoutPlan.difficulty}
          onChange={(e) => onPlanChange('difficulty', e.target.value)}
          className="select"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      
      <div className="workout-form-group">
        <label htmlFor="estimatedDuration">Estimated Duration (minutes)</label>
        <input
          type="number"
          id="estimatedDuration"
          value={workoutPlan.estimatedDuration}
          onChange={(e) => onPlanChange('estimatedDuration', parseInt(e.target.value) || 0)}
          className="input"
          min="1"
        />
      </div>
      
      <div className="workout-form-group">
        <label>Tags</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {workoutPlan.tags.map(tag => (
            <span 
              key={tag} 
              className="tag"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                backgroundColor: 'var(--Primary-Color-Red)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                style={{ 
                  background: 'none', 
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag and press Enter"
            className="input"
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="workout-button secondary"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="workout-form-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="isPublic"
            checked={workoutPlan.isPublic}
            onChange={(e) => onPlanChange('isPublic', e.target.checked)}
            style={{ width: 'auto' }}
          />
          <label htmlFor="isPublic" style={{ marginBottom: 0 }}>
            Make this workout plan public
          </label>
        </div>
      </div>
      
      <div className="workout-form-group">
        <label>Exercises</label>
        {workoutPlan.exercises.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No exercises added yet. Select exercises from the list.</p>
        ) : (
          <div className="exercise-list">
            {workoutPlan.exercises.map((exercise, index) => (
              <div key={index} className="exercise-item">
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Exercise {index + 1}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Sets</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => onExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Reps</label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => onExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                        Rest (seconds)
                      </label>
                      <input
                        type="number"
                        value={exercise.restPeriod}
                        onChange={(e) => onExerciseChange(index, 'restPeriod', parseInt(e.target.value) || 0)}
                        className="input"
                        min="0"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                        Duration (optional)
                      </label>
                      <input
                        type="number"
                        value={exercise.duration || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value);
                          onExerciseChange(index, 'duration', value);
                        }}
                        className="input"
                        min="0"
                        placeholder="seconds"
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Notes</label>
                    <textarea
                      value={exercise.notes}
                      onChange={(e) => onExerciseChange(index, 'notes', e.target.value)}
                      className="input"
                      rows="2"
                      placeholder="Optional notes for this exercise"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => onRemoveExercise(index)}
                  className="workout-button primary"
                  style={{ 
                    alignSelf: 'flex-start',
                    backgroundColor: '#d10000',
                    fontSize: '0.875rem',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="workout-form-group" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <button type="submit" className="workout-button primary">
          {isEditing ? 'Update Workout Plan' : 'Save Workout Plan'}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="workout-button secondary"
          >
            Cancel
          </button>
        )}
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
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  onCancel: PropTypes.func
};

export default WorkoutPlanForm;
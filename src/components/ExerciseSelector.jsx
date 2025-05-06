import PropTypes from 'prop-types';
import './ExerciseSelector.css';

const ExerciseSelector = ({ exercises, onAddExercise }) => {
  // Add defensive check to ensure exercises is an array
  const exerciseArray = Array.isArray(exercises) ? exercises : [];
  
  return (
    <div className="exercise-selector">
      {exerciseArray.length === 0 ? (
        <div className="empty-message">
          No exercises available. Please check your connection.
        </div>
      ) : (
        exerciseArray.map(exercise => (
          <div key={exercise._id || exercise.id} className="exercise-item">
            <div className="exercise-info">
              <h4>{exercise.name}</h4>
              <p>{exercise.muscleGroup} • {exercise.equipment}</p>
            </div>
            <button
              onClick={() => onAddExercise(exercise)}
              className="add-exercise-btn"
              aria-label={`Add ${exercise.name}`}
            >
              <span className="btn-icon">+</span>
              <span className="btn-text">Add</span>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

ExerciseSelector.propTypes = {
  exercises: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      muscleGroup: PropTypes.string.isRequired,
      equipment: PropTypes.string.isRequired
    })
  ).isRequired,
  onAddExercise: PropTypes.func.isRequired
};

ExerciseSelector.defaultProps = {
  exercises: []
};

export default ExerciseSelector;
import PropTypes from 'prop-types';
import './ExcerciseCard.css';

const ExerciseCard = ({ exercise }) => {
  return (
    <div className="workout-card exercise-card">
      <div className="exercise-card-header">
        <h3 className="exercise-title">{exercise.name}</h3>
        <div className="exercise-tags">
          <span className="exercise-tag">{exercise.muscleGroup}</span>
          <span className="exercise-tag">{exercise.equipment}</span>
          <span className="exercise-tag difficulty-tag">{exercise.difficulty}</span>
        </div>
      </div>
      
      <div className="exercise-card-body">
        <p className="exercise-description">{exercise.description}</p>
        
        {exercise.formGuidance && (
          <div className="exercise-guidance">
            <h4 className="guidance-title">Form Guidance:</h4>
            <p className="guidance-text">{exercise.formGuidance}</p>
          </div>
        )}
      </div>
      
      <div className="exercise-card-footer">
        <span className="exercise-detail">
          <strong>Muscle Group:</strong> {exercise.muscleGroup}
        </span>
        <span className="exercise-detail">
          <strong>Equipment:</strong> {exercise.equipment}
        </span>
      </div>
    </div>
  );
};

ExerciseCard.propTypes = {
  exercise: PropTypes.shape({
    name: PropTypes.string.isRequired,
    muscleGroup: PropTypes.string.isRequired,
    equipment: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    formGuidance: PropTypes.string,
    mediaUrls: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default ExerciseCard;
import PropTypes from 'prop-types';

const ExerciseSelector = ({ exercises, onAddExercise }) => {
  // Add defensive check to ensure exercises is an array
  const exerciseArray = Array.isArray(exercises) ? exercises : [];
  
  return (
    <div className="space-y-4">
      {exerciseArray.length === 0 ? (
        <div className="border rounded p-4 text-center text-gray-500">
          No exercises available. Please check your connection.
        </div>
      ) : (
        exerciseArray.map(exercise => (
          <div key={exercise._id || exercise.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <h4 className="font-medium">{exercise.name}</h4>
              <p className="text-sm text-gray-600">{exercise.muscleGroup} • {exercise.equipment}</p>
            </div>
            <button
              onClick={() => onAddExercise(exercise)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Add
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
import PropTypes from 'prop-types';

const ExerciseSelector = ({ exercises, onAddExercise }) => {
  return (
    <div className="space-y-4">
      {exercises.map(exercise => (
        <div key={exercise._id} className="border rounded p-3 flex justify-between items-center">
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
      ))}
    </div>
  );
};

ExerciseSelector.propTypes = {
  exercises: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      muscleGroup: PropTypes.string.isRequired,
      equipment: PropTypes.string.isRequired
    })
  ).isRequired,
  onAddExercise: PropTypes.func.isRequired
};

export default ExerciseSelector;
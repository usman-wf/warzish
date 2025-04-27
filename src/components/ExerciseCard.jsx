import PropTypes from 'prop-types';

const ExerciseCard = ({ exercise }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {exercise.muscleGroup}
          </span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            {exercise.equipment}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            {exercise.difficulty}
          </span>
        </div>
        <p className="text-gray-600 mb-3">{exercise.description}</p>
        <div className="space-y-2">
          <h4 className="font-medium">Form Guidance:</h4>
          <p className="text-sm text-gray-700">{exercise.formGuidance}</p>
        </div>
      </div>
      {exercise.mediaUrls && exercise.mediaUrls.length > 0 && (
        <div className="bg-gray-100 p-4">
          <h4 className="font-medium mb-2">Media:</h4>
          <div className="flex space-x-2 overflow-x-auto">
            {exercise.mediaUrls.map((url, index) => (
              <div key={index} className="flex-shrink-0">
                {url.endsWith('.mp4') ? (
                  <video src={url} controls className="h-24 rounded" />
                ) : (
                  <img src={url} alt={exercise.name} className="h-24 rounded" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
    formGuidance: PropTypes.string.isRequired,
    mediaUrls: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default ExerciseCard;
import PropTypes from 'prop-types';

const WorkoutPlanCard = ({ plan, isSaved, onSave }) => {
  // Safely destructure with defaults
  const {
    _id = '',
    name = 'Untitled Plan',
    description = 'No description available',
    difficulty = 'Not specified',
    estimatedDuration = 0,
    tags = []
  } = plan || {};

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          {!isSaved && (
            <button
              onClick={() => onSave(_id, 'My Workouts')}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              disabled={!_id} // Disable if no ID
            >
              Save
            </button>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {difficulty}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            {estimatedDuration} mins
          </span>
          {tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

WorkoutPlanCard.propTypes = {
  plan: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    difficulty: PropTypes.string,
    estimatedDuration: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isSaved: PropTypes.bool,
  onSave: PropTypes.func
};

WorkoutPlanCard.defaultProps = {
  plan: {
    _id: '',
    name: 'Untitled Plan',
    description: 'No description available',
    difficulty: 'Not specified',
    estimatedDuration: 0,
    tags: []
  },
  isSaved: false,
  onSave: () => {}
};

export default WorkoutPlanCard;
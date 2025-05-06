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

  const handleSave = () => {
    // Make sure we have a valid ID
    if (!_id) {
      console.error('Cannot save workout: Invalid workout ID');
      return;
    }
    console.log('Saving workout with ID:', _id);
    onSave(_id, 'My Workouts');
  };

  return (
    <div className="card">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3>{name}</h3>
            <p>{description}</p>
          </div>
          {!isSaved && (
            <button
              onClick={handleSave}
              className="button primary"
              disabled={!_id} // Disable if no ID
            >
              Save
            </button>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="tag">{difficulty}</span>
          <span className="tag">{estimatedDuration} mins</span>
          {tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
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
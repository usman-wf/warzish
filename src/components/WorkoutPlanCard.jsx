import PropTypes from 'prop-types';

const WorkoutPlanCard = ({ plan, isSaved, onSave }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
          </div>
          {!isSaved && (
            <button
              onClick={() => onSave(plan._id, 'My Workouts')}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {plan.difficulty}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            {plan.estimatedDuration} mins
          </span>
          {plan.tags.map(tag => (
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
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    estimatedDuration: PropTypes.number.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired
};

export default WorkoutPlanCard;
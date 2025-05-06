import PropTypes from 'prop-types';
import './WorkoutCard.css';

const WorkoutCard = ({ workout, clicked, onSave, onDelete, isSaved, isOwner, isLoading }) => {
    // Prevent event propagation for action buttons
    const handleActionClick = (e, action) => {
        e.stopPropagation(); // Prevent triggering the card click
        action && action(workout.id);
    };

    return (
        <div className={`workout-card ${workout.className || ''}`} onClick={() => clicked(workout)}>
            <div className="workout-card-header">
                <span className="workout-category">{workout.category}</span>
                
                {/* Delete button for saved workouts */}
                {onDelete && isSaved && (
                    <button 
                        className="delete-button" 
                        onClick={(e) => handleActionClick(e, onDelete)}
                        aria-label="Remove saved workout"
                        disabled={isLoading}
                    >
                        Remove
                    </button>
                )}
            </div>
            
            <h3 className="workout-title">{workout.title}</h3>
            <p className="workout-description">{workout.description}</p>
            
            {/* Save button - only show if onSave function is provided and user is not the owner */}
            {onSave && !isOwner && (
                <div className="save-button-container">
                    <button 
                        className={`save-button ${isSaved ? 'saved' : ''}`} 
                        onClick={(e) => handleActionClick(e, onSave)}
                        aria-label={isSaved ? "Saved workout" : "Save workout"}
                        disabled={isLoading || isSaved}
                    >
                        {isLoading ? (
                            <span className="save-loading">Saving...</span>
                        ) : isSaved ? (
                            <span>✓ Saved</span>
                        ) : (
                            <span>Save Workout</span>
                        )}
                    </button>
                </div>
            )}
            
            <div className="workout-card-footer">
                <div className="workout-detail">
                    <strong>Duration:</strong> {workout.duration}
                </div>
                <div className="workout-detail">
                    <strong>Difficulty:</strong> {workout.difficulty}
                </div>
                <div className="workout-creator">
                    By: {workout.creator}
                </div>
            </div>
        </div>
    );
};

WorkoutCard.propTypes = {
    workout: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        duration: PropTypes.string.isRequired,
        difficulty: PropTypes.string.isRequired,
        creator: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        className: PropTypes.string // Optional class name for styling
    }).isRequired,
    clicked: PropTypes.func.isRequired,
    onSave: PropTypes.func, // Optional function to save the workout
    onDelete: PropTypes.func, // Optional function to delete the workout
    isSaved: PropTypes.bool, // Whether this workout is already saved
    isOwner: PropTypes.bool, // Whether current user is the owner of this workout
    isLoading: PropTypes.bool // Whether the save/delete action is in progress
};

WorkoutCard.defaultProps = {
    isSaved: false,
    isOwner: false,
    isLoading: false
};

export default WorkoutCard;
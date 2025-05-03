import PropTypes from 'prop-types';
import './WorkoutCard.css';

const WorkoutCard = ({ workout, clicked }) => {
    return (
        <div className="WorkoutCard" onClick={() => clicked(workout.id)}>
            <div className="WorkoutCardHeader">
                <div className="WorkoutCardCategory" data-category={workout.category}>{workout.category}</div>
                <div className="WorkoutCardRating">
                    {Array(5).fill().map((_, i) => (
                        <span 
                            key={i} 
                            className={`Star ${i < Math.floor(workout.rating) ? 'Filled' : ''}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>
            <h3 className="WorkoutCardTitle">{workout.title}</h3>
            <p className="WorkoutCardDescription">{workout.description}</p>
            <div className="WorkoutCardFooter">
                <div className="WorkoutCardDetail">
                    <strong>Duration</strong> {workout.duration}
                </div>
                <div className="WorkoutCardDetail">
                    <strong>Difficulty</strong> {workout.difficulty}
                </div>
            </div>
            <div className="WorkoutCardCreator">
                By: {workout.creator}
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
        rating: PropTypes.number.isRequired,
        creator: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    clicked: PropTypes.func.isRequired,
};

export default WorkoutCard;
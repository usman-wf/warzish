import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';

const WorkoutLibrary = ({ workouts, clicked }) => {
    // Check if workouts is undefined or not an array
    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
        return (
            <div className="WorkoutLibrary">
                <h1 className="WorkoutLibraryTitle">Workout Library</h1>
                <div className="WorkoutLibraryWrapper">
                    <p>No workouts available. Check back later!</p>
                </div>
            </div>
        );
    }

    const clickWorkoutHandler = (workoutId) => {
        const workout = workouts.find(w => w.id === workoutId);
        if (workout) clicked(workout);
    };

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">Workout Library</h1>
            <div className="WorkoutLibraryWrapper">
                {workouts.map((item) => (
                    <WorkoutCard key={item.id} workout={item} clicked={clickWorkoutHandler} />
                ))}
            </div>
        </div>
    );
};

WorkoutLibrary.propTypes = {
    workouts: PropTypes.array,
    clicked: PropTypes.func.isRequired,
};

WorkoutLibrary.defaultProps = {
    workouts: []
};

export default WorkoutLibrary;
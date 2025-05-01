import PropTypes from "prop-types";

const WorkoutDetails = ({ workout }) => {
    return (
        <div className="WorkoutDetails">
            <div className="WorkoutDetailsContent">
                <h2>{workout.title}</h2>
                <p className="WorkoutDescription">{workout.description}</p>
                <div className="WorkoutInfo">
                    <p><strong>Duration:</strong> {workout.duration}</p>
                    <p><strong>Difficulty:</strong> {workout.difficulty}</p>
                </div>

                {workout.exercises && workout.exercises.length > 0 && (
                    <div className="ExerciseList">
                        <h3>Exercises:</h3>
                        {workout.exercises.map((exercise, index) => (
                            <div className="Exercise" key={index}>
                                <h4>{exercise.name}</h4>
                                <p><strong>Muscle Group:</strong> {exercise.muscleGroup}</p>
                                <p><strong>Equipment:</strong> {exercise.equipment}</p>
                                <p><strong>Sets:</strong> {exercise.sets}</p>
                                <p><strong>Reps:</strong> {exercise.reps}</p>
                                <p><strong>Rest Interval:</strong> {exercise.restInterval}</p>
                                <p><strong>Instructions:</strong> {exercise.instructions}</p>
                            </div>
                        ))}
                    </div>
                )}

                {workout.additionalInfo && (
                    <div className="AdditionalInfo">
                        <h3>Additional Information:</h3>
                        <p>{workout.additionalInfo}</p>
                    </div>
                )}

                <div className="StartWorkoutButton">
                    <button>Start Workout</button>
                </div>
            </div>
        </div>
    );
};

WorkoutDetails.propTypes = {
    workout: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        duration: PropTypes.string.isRequired,
        difficulty: PropTypes.string.isRequired,
        exercises: PropTypes.array,
        additionalInfo: PropTypes.string,
    }).isRequired,
};

export default WorkoutDetails;







// import PropTypes from "prop-types";
// // import './WorkoutDetails.css'; // Assuming separate CSS file for styling

// const WorkoutDetails = ({ workout }) => {
//     return (
//         <div className="WorkoutDetails">
//             {/* <Navbar /> */}
//             <div className="WorkoutDetailsContent">
//                 <h2>{workout.title}</h2>
//                 <p className="WorkoutDescription">{workout.description}</p>
//                 <div className="WorkoutInfo">
//                     <p><strong>Duration:</strong> {workout.duration}</p>
//                     <p><strong>Difficulty:</strong> {workout.difficulty}</p>
//                 </div>
//                 <div className="ExerciseList">
//                     <h3>Exercises:</h3>
//                     {workout.exercises.map((exercise, index) => (
//                         <div className="Exercise" key={index}>
//                             <h4>{exercise.name}</h4>
//                             <p><strong>Muscle Group:</strong> {exercise.muscleGroup}</p>
//                             <p><strong>Equipment:</strong> {exercise.equipment}</p>
//                             <p><strong>Sets:</strong> {exercise.sets}</p>
//                             <p><strong>Reps:</strong> {exercise.reps}</p>
//                             <p><strong>Rest Interval:</strong> {exercise.restInterval}</p>
//                             <p><strong>Instructions:</strong> {exercise.instructions}</p>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="AdditionalInfo">
//                     <h3>Additional Information:</h3>
//                     <p>{workout.additionalInfo}</p>
//                 </div>
//                 <div className="StartWorkoutButton">
//                     <button>Start Workout</button>
//                 </div>
//             </div>
//         </div>
//     );
// };
// WorkoutDetails.propTypes = {
//     workout: PropTypes.shape({
//         title: PropTypes.string.isRequired,
//         description: PropTypes.string.isRequired,
//         duration: PropTypes.string.isRequired,
//         difficulty: PropTypes.string.isRequired,
//         exercises: PropTypes.arrayOf(
//             PropTypes.shape({
//                 name: PropTypes.string.isRequired,
//                 muscleGroup: PropTypes.string.isRequired,
//                 equipment: PropTypes.string.isRequired,
//                 sets: PropTypes.number.isRequired,
//                 reps: PropTypes.number.isRequired,
//                 restInterval: PropTypes.string.isRequired,
//                 instructions: PropTypes.string.isRequired,
//             })
//         ).isRequired,
//         additionalInfo: PropTypes.string,
//     }).isRequired,
// };

// export default WorkoutDetails;
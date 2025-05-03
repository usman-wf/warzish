import React from "react";
import Navbar from "../components/Navbar";
// import './WorkoutDetails.css'; // Assuming separate CSS file for styling

const WorkoutDetails = ({ workout }) => {
    return (
        <div className="WorkoutDetails">
            {/* <Navbar /> */}
            <div className="WorkoutDetailsContent">
                <h2>{workout.title}</h2>
                <p className="WorkoutDescription">{workout.description}</p>
                <div className="WorkoutInfo">
                    <p><strong>Duration:</strong> {workout.duration}</p>
                    <p><strong>Difficulty:</strong> {workout.difficulty}</p>
                </div>
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
                <div className="AdditionalInfo">
                    <h3>Additional Information:</h3>
                    <p>{workout.additionalInfo}</p>
                </div>
                <div className="StartWorkoutButton">
                    <button>Start Workout</button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutDetails;

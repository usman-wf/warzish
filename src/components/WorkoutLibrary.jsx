import React from "react";
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css'

const WorkoutLibrary = (props) => {

    const workoutDetails = [
        {
            id: 1282,
            title: "Full Body HIIT Workout",
            description: "A high-intensity interval training workout targeting all major muscle groups.",
            duration: "45 minutes",
            difficulty: "Intermediate",
            exercises: [
                {
                    name: "Jump Squats",
                    muscleGroup: "Legs",
                    equipment: "None",
                    sets: 3,
                    reps: 12,
                    restInterval: "30 seconds",
                    instructions: "Start with feet shoulder-width apart. Squat down, then explode upwards into a jump."
                },
                // Add more exercises as needed
            ],
            additionalInfo: "Warm-up with 5 minutes of light cardio. Cool down with 10 minutes of stretching.",
        },
        {
            id: 1281,
            title: "Full Body HIIT Workout",
            description: "A high-intensity interval training workout targeting all major muscle groups.",
            duration: "45 minutes",
            difficulty: "Intermediate",
            exercises: [
                {
                    name: "Jump Squats",
                    muscleGroup: "Legs",
                    equipment: "None",
                    sets: 3,
                    reps: 12,
                    restInterval: "30 seconds",
                    instructions: "Start with feet shoulder-width apart. Squat down, then explode upwards into a jump."
                },
                // Add more exercises as needed
            ],
            additionalInfo: "Warm-up with 5 minutes of light cardio. Cool down with 10 minutes of stretching.",
        },
    ];

    const workouts = [{
        id: 1281,
        title: 'Morning Yoga Flow',
        category: "Yoga",
        duration: "30 minutes",
        difficulty: "Beginner",
        rating: 4,
        creator: "yogafit23",
        description: "Start your day with this energizing morning yoga flow designed to increase flexibility and improve focus. This gentle routine combines breathing exercises with beginner-friendly yoga poses to help you feel refreshed and ready for the day ahead.",
    }];

    const clickWorkoutHandler=(workoutId)=>{
        const workout = workoutDetails.find((workout) => workout.id === workoutId);
        props.clicked(workout);
    }

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">
                Workout Library
            </h1>
            <div className="WorkoutLibraryWrapper">
                {workouts.map((item) => {
                    return <WorkoutCard workout={item} clicked={clickWorkoutHandler} />
                }
                )}
            </div>
        </div>
    )
}

export default WorkoutLibrary
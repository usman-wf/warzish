import React from "react";
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css'

const WorkoutLibrary = () => {

    const workouts = [
        {
            id: 1283,
            title: 'Personal Yoga Flow',
            category: "Yoga",
            duration: "30 minutes",
            difficulty: "Beginner",
            rating: 4,
            creator: "yogafit23",
            description: "Start your day with this energizing morning yoga flow designed to increase flexibility and improve focus. This gentle routine combines breathing exercises with beginner-friendly yoga poses to help you feel refreshed and ready for the day ahead.",
        },
         {
            id: 1285,
            title: 'Personal Yoga Flow',
            category: "Yoga",
            duration: "30 minutes",
            difficulty: "Beginner",
            rating: 4,
            creator: "yogafit23",
            description: "Start your day with this energizing morning yoga flow designed to increase flexibility and improve focus. This gentle routine combines breathing exercises with beginner-friendly yoga poses to help you feel refreshed and ready for the day ahead.",
        },
    ];

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">
                Personal Workouts
            </h1>
            <div className="WorkoutLibraryWrapper">
                {workouts.map((item) => {
                    return <WorkoutCard workout={item} />
                }
                )}
                {/* <WorkoutCard /> */}
            </div>
        </div>
    )
}

export default WorkoutLibrary
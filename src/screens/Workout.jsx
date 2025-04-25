import React, { useState } from "react";
import Navbar from "../components/Navbar";
import WorkoutLibrary from "../components/WorkoutLibrary";
import PersonalWorkouts from "../components/PersonalWorkouts";
import WorkoutDetails from "../components/WorkoutDetails";
// import SavedWorkouts from "../components/SavedWorkouts";
import Modal from "react-modal";
import './Workout.css';

const Workout = () => {
    // State to keep track of the active tab
    const [activeTab, setActiveTab] = useState("Library");

    // Function to handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    // Function to open the modal and set the selected workout
    const openModal = (workout) => {
        setSelectedWorkout(workout);
        setModalIsOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setSelectedWorkout(null);
        setModalIsOpen(false);
    };

    const workoutDetails = {
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
    };
    // Render the appropriate component based on the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case "Library":
                return <WorkoutLibrary clicked={openModal}/>;
            case "Personal":
                return <PersonalWorkouts clicked={openModal}/>;
            case "Saved":
                return <WorkoutDetails workout={workoutDetails} />;
            default:
                return null;
        }
    };

    return (
        <React.Fragment>
            <div className="Workout">
                <Navbar />
                <div className="WorkoutHero">
                    <div className="WorkoutNav">
                        {/* Use conditional rendering to apply Active class to the active tab */}
                        <div
                            className={`WorkoutNavItem ${activeTab === "Library" ? "Active" : "Inactive"}`}
                            onClick={() => handleTabChange("Library")}
                        >
                            Workout Library
                        </div>
                        <div
                            className={`WorkoutNavItem ${activeTab === "Personal" ? "Active" : "Inactive"}`}
                            onClick={() => handleTabChange("Personal")}
                        >
                            Personal Workouts
                        </div>
                        <div
                            className={`WorkoutNavItem ${activeTab === "Saved" ? "Active" : "Inactive"}`}
                            onClick={() => handleTabChange("Saved")}
                        >
                            Saved Workouts
                        </div>
                        {/* <button onClick={() => openModal(workoutDetails)}>View Details</button> */}
                    </div>
                    {/* Render the content of the active tab */}
                    {renderTabContent()}

                    {/* Modal/Popup for Workouts */}
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="Workout Details"
                    >
                        {/* Render WorkoutDetails component inside the modal */}
                        {selectedWorkout && <WorkoutDetails workout={selectedWorkout} />}
                        <button onClick={closeModal}>Close Modal</button>
                    </Modal>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Workout;

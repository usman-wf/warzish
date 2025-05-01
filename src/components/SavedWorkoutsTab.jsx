import { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';

const SavedWorkoutsTab = ({ clicked }) => {
    const [savedWorkouts, setSavedWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedWorkouts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/exercise/workout-saved', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // If we need to get the actual workout details from the saved references
                const workoutDetails = await Promise.all(
                    response.data.map(async (saved) => {
                        try {
                            const workoutRes = await axios.get(`http://localhost:3030/exercise/workout/${saved.workoutPlanId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            return {
                                ...workoutRes.data,
                                savedId: saved._id,
                                folder: saved.folder
                            };
                        } catch (error) {
                            console.error(`Error fetching workout details for ${saved.workoutPlanId}:`, error);
                            return null;
                        }
                    })
                );
                
                // Filter out any failed requests
                setSavedWorkouts(workoutDetails.filter(workout => workout !== null));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching saved workouts:', error);
                // Fallback data
                setSavedWorkouts([
                    {
                        id: 1290,
                        title: 'Strength Builder',
                        category: "Strength",
                        duration: "45 minutes",
                        difficulty: "Intermediate",
                        rating: 4.7,
                        creator: "GymPro",
                        folder: "Strength Training",
                        description: "A strength-focused workout targeting major muscle groups."
                    },
                    {
                        id: 1291,
                        title: 'Cardio Blast',
                        category: "Cardio",
                        duration: "30 minutes",
                        difficulty: "Advanced",
                        rating: 4.5,
                        creator: "RunFast",
                        folder: "Cardio",
                        description: "A high-intensity cardio session to boost endurance and burn calories."
                    }
                ]);
                setLoading(false);
            }
        };

        fetchSavedWorkouts();
    }, []);

    const handleDeleteSaved = async (workoutId) => {
        try {
            const token = localStorage.getItem('token');
            const workout = savedWorkouts.find(w => w.id === workoutId);
            
            if (workout && workout.savedId) {
                await axios.delete(`http://localhost:3030/exercise/workout-saved/${workout.savedId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setSavedWorkouts(prev => prev.filter(w => w.id !== workoutId));
            }
        } catch (error) {
            console.error('Error deleting saved workout:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading saved workouts...</div>;
    }

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">Saved Workouts</h1>
            {savedWorkouts.length === 0 ? (
                <div className="WorkoutLibraryWrapper">
                    <p>You dont have any saved workouts yet.</p>
                </div>
            ) : (
                <div className="WorkoutLibraryWrapper">
                    {savedWorkouts.map((item) => (
                        <div key={item.id} className="SavedWorkoutCard">
                            <WorkoutCard 
                                workout={item} 
                                clicked={() => clicked(item)}
                            />
                            <div className="SavedWorkoutActions">
                                <select
                                    value={item.folder}
                                    onChange={(e) => {
                                        // Handle folder change
                                        const newFolder = e.target.value;
                                        // Update folder in API and state
                                        // This is a placeholder for actual implementation
                                        console.log(`Changed folder for ${item.title} to ${newFolder}`);
                                    }}
                                    className="FolderSelect"
                                >
                                    <option value="Strength Training">Strength Training</option>
                                    <option value="Cardio">Cardio</option>
                                    <option value="HIIT">HIIT</option>
                                    <option value="Custom">Custom</option>
                                </select>
                                <button 
                                    onClick={() => handleDeleteSaved(item.id)}
                                    className="DeleteButton"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

SavedWorkoutsTab.propTypes = {
    clicked: PropTypes.func.isRequired,
};

export default SavedWorkoutsTab;
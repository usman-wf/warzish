import { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';

const API_BASE_URL = 'http://localhost:3030';

const SavedWorkoutsTab = ({ clicked }) => {
    const [savedWorkouts, setSavedWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use a standard function declaration instead of const for better hoisting
    function fetchSavedWorkouts() {
        const doFetch = async () => {
            try {
                setError(null);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('Saved workouts response:', response.data);
                
                // Check for both direct array and nested data array formats
                const savedWorkoutsData = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.data || []);
                
                console.log('Processed savedWorkoutsData:', savedWorkoutsData);
                
                if (!Array.isArray(savedWorkoutsData)) {
                    throw new Error('Invalid response format');
                }
                
                // Process one workout at a time to avoid Promise.all issues
                const workoutDetails = [];
                
                for (const savedWorkout of savedWorkoutsData) {
                    try {
                        console.log('Saved workout object:', savedWorkout);
                        
                        // Extract workoutPlanId - handle both direct and nested object structures
                        let workoutPlanId;
                        
                        if (typeof savedWorkout.workoutPlanId === 'string') {
                            workoutPlanId = savedWorkout.workoutPlanId;
                        } else if (typeof savedWorkout.workoutPlanId === 'object' && savedWorkout.workoutPlanId !== null) {
                            // It's an object - extract the ID
                            workoutPlanId = savedWorkout.workoutPlanId._id;
                            
                            // If it's already populated, we can use the data directly
                            if (savedWorkout.workoutPlanId.name) {
                                console.log('Using already populated workout data:', savedWorkout.workoutPlanId);
                                
                                workoutDetails.push({
                                    id: savedWorkout.workoutPlanId._id,
                                    title: savedWorkout.workoutPlanId.name,
                                    category: savedWorkout.workoutPlanId.tags?.[0] || "Workout",
                                    duration: `${savedWorkout.workoutPlanId.estimatedDuration || 30} minutes`,
                                    difficulty: savedWorkout.workoutPlanId.difficulty || "Intermediate",
                                    description: savedWorkout.workoutPlanId.description || "",
                                    exercises: savedWorkout.workoutPlanId.exercises || [],
                                    savedId: savedWorkout._id,
                                    folder: savedWorkout.folder,
                                    rating: 4,
                                    creator: "Warzish"
                                });
                                continue; // Skip the API call
                            }
                        } else {
                            // Fallback to other options
                            workoutPlanId = (savedWorkout.workoutPlan && savedWorkout.workoutPlan._id) || 
                                         savedWorkout._id;
                        }
                        
                        if (!workoutPlanId || typeof workoutPlanId !== 'string') {
                            console.error('Invalid workoutPlanId format:', workoutPlanId);
                            console.error('From saved workout:', savedWorkout);
                            continue;
                        }
                        
                        console.log('Fetching workout with ID:', workoutPlanId);
                        
                        const workoutResponse = await axios.get(`${API_BASE_URL}/exercise/workout/${workoutPlanId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        console.log('Workout detail response:', workoutResponse.data);
                        
                        // Extract workout data from response
                        const workoutData = workoutResponse.data.data || workoutResponse.data;
                        
                        if (!workoutData) {
                            console.error('Invalid workout data format', workoutResponse.data);
                            continue;
                        }
                        
                        workoutDetails.push({
                            id: workoutData._id,
                            title: workoutData.name,
                            category: workoutData.tags?.[0] || "Workout",
                            duration: `${workoutData.estimatedDuration || 30} minutes`,
                            difficulty: workoutData.difficulty || "Intermediate",
                            description: workoutData.description || "",
                            exercises: workoutData.exercises || [],
                            savedId: savedWorkout._id,
                            folder: savedWorkout.folder,
                            rating: 4,
                            creator: "Warzish"
                        });
                    } catch (err) {
                        console.error('Error processing saved workout:', err);
                    }
                }
                
                setSavedWorkouts(workoutDetails);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching saved workouts:', err);
                setError('Failed to load saved workouts. Please try again.');
                setLoading(false);
            }
        };
        
        doFetch();
    }

    useEffect(() => {
        fetchSavedWorkouts();
    }, []);

    const handleDeleteSaved = async (workoutId) => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const workout = savedWorkouts.find(w => w.id === workoutId);
            
            if (!workout || !workout.savedId) {
                throw new Error('Cannot identify workout to delete');
            }
            
            await axios.delete(`${API_BASE_URL}/exercise/workout-saved/${workout.savedId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSavedWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
        } catch (err) {
            console.error('Error deleting saved workout:', err);
            setError('Failed to delete workout. Please try again.');
        }
    };

    const handleUpdateFolder = async (workoutId, newFolder) => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const workout = savedWorkouts.find(w => w.id === workoutId);
            
            if (!workout || !workout.savedId) {
                throw new Error('Cannot identify workout to update');
            }
            
            await axios.put(`${API_BASE_URL}/exercise/workout-saved/${workout.savedId}`, 
                { folder: newFolder },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            setSavedWorkouts(prevWorkouts => 
                prevWorkouts.map(w => w.id === workoutId ? { ...w, folder: newFolder } : w)
            );
        } catch (err) {
            console.error('Error updating workout folder:', err);
            setError('Failed to update folder. Please try again.');
        }
    };

    if (loading) {
        return <div className="loading">Loading saved workouts...</div>;
    }

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">Saved Workouts</h1>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {savedWorkouts.length === 0 ? (
                <div className="WorkoutLibraryWrapper">
                    <p>You don&apos;t have any saved workouts yet.</p>
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
                                    onChange={(e) => handleUpdateFolder(item.id, e.target.value)}
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
    clicked: PropTypes.func.isRequired
};

export default SavedWorkoutsTab;
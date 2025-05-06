import { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3030';

const SavedWorkoutsTab = ({ clicked }) => {
    const navigate = useNavigate();
    const [savedWorkouts, setSavedWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null); // Track which workout is being deleted

    // Use a standard function declaration instead of const for better hoisting
    function fetchSavedWorkouts() {
        const doFetch = async () => {
            try {
                setError(null);
                setLoading(true);
                
                const token = localStorage.getItem('token');
                const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                
                if (!isAuthenticated || !token) {
                    toast.error('Please log in to view saved workouts');
                    navigate('/login');
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
                                    folder: savedWorkout.folder || "Favorites",
                                    creator: "Warzish"
                                });
                                continue; // Skip the API call
                            }
                        } else {
                            // Fallback to other options
                            workoutPlanId = (savedWorkout.workoutPlan && savedWorkout.workoutPlan._id) || 
                                         savedWorkout._id;
                        }
                        
                        // Check if workoutPlanId is null or invalid
                        if (!workoutPlanId || workoutPlanId === savedWorkout._id) {
                            console.log('Invalid or null workoutPlanId, creating placeholder:', savedWorkout);
                            
                            // Create placeholder for a missing workout
                            workoutDetails.push({
                                id: savedWorkout._id, // Use the saved workout ID as a unique identifier
                                title: "Missing Workout",
                                category: "Unknown",
                                duration: "Unknown",
                                difficulty: "Unknown",
                                description: "This workout is no longer available or was removed from the system.",
                                exercises: [],
                                savedId: savedWorkout._id,
                                folder: savedWorkout.folder || "Favorites",
                                creator: "Unknown",
                                isUnavailable: true // Flag to handle differently in UI
                            });
                            continue; // Skip the fetch attempt
                        }
                        
                        if (!workoutPlanId || typeof workoutPlanId !== 'string') {
                            console.error('Invalid workoutPlanId format:', workoutPlanId);
                            console.error('From saved workout:', savedWorkout);
                            continue;
                        }
                        
                        console.log('Fetching workout with ID:', workoutPlanId);
                        
                        try {
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
                                folder: savedWorkout.folder || "Favorites",
                                creator: "Warzish"
                            });
                        } catch (fetchErr) {
                            console.error(`Error fetching workout ${workoutPlanId}:`, fetchErr);
                            
                            // Add a placeholder for the missing workout
                            workoutDetails.push({
                                id: workoutPlanId,
                                title: "Workout Not Available",
                                category: "Unknown",
                                duration: "Unknown",
                                difficulty: "Unknown",
                                description: "This workout may have been deleted or is no longer available.",
                                exercises: [],
                                savedId: savedWorkout._id,
                                folder: savedWorkout.folder || "Favorites",
                                creator: "Unknown",
                                isUnavailable: true // Flag to handle differently in UI
                            });
                        }
                    } catch (err) {
                        console.error('Error processing saved workout:', err);
                    }
                }
                
                setSavedWorkouts(workoutDetails);
            } catch (err) {
                console.error('Error fetching saved workouts:', err);

                // Handle authentication errors
                if (err.response?.status === 401) {
                    toast.error('Your session has expired. Please log in again.');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                
                // Handle HTML error responses (likely server issues)
                const isHtmlResponse = err.response?.data && 
                    typeof err.response.data === 'string' && 
                    err.response.data.includes('<!DOCTYPE html>');
                
                if (isHtmlResponse) {
                    console.error('Received HTML error response - server issue');
                    setError('Server error. Please try again later.');
                    toast.error('Server error. Please try again later.');
                } else {
                    setError(err.response?.data?.message || err.message || 'Failed to load saved workouts');
                    toast.error(err.response?.data?.message || err.message || 'Failed to load saved workouts');
                }
            } finally {
                setLoading(false);
            }
        };
        
        doFetch();
    }

    useEffect(() => {
        fetchSavedWorkouts();
    }, [navigate]);

    const handleDeleteSaved = async (workoutId) => {
        try {
            setError(null);
            setDeletingId(workoutId); // Set deleting ID to show loading state
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('Authentication token not found');
                navigate('/login');
                return;
            }
            
            const workout = savedWorkouts.find(w => w.id === workoutId);
            
            if (!workout) {
                throw new Error('Cannot identify workout to delete');
            }
            
            if (!workout.savedId) {
                // If savedId is missing but we have the workout entry, 
                // just remove it from UI (edge case)
                setSavedWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
                toast.success('Workout removed from saved list');
                return;
            }
            
            await axios.delete(`${API_BASE_URL}/exercise/workout-saved/${workout.savedId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSavedWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
            toast.success('Workout removed from saved list');
        } catch (err) {
            console.error('Error deleting saved workout:', err);
            toast.error('Failed to delete workout. Please try again.');
        } finally {
            setDeletingId(null); // Clear deleting state
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading saved workouts...</p>
            </div>
        );
    }

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">Saved Workouts</h1>
            
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button
                        onClick={fetchSavedWorkouts}
                        className="retry-button"
                    >
                        Retry
                    </button>
                </div>
            )}
            
            {!error && savedWorkouts.length === 0 ? (
                <div className="WorkoutLibraryWrapper empty-state">
                    <p>You don&apos;t have any saved workouts yet.</p>
                    <button 
                        onClick={() => navigate('/workout')}
                        className="workout-button secondary"
                    >
                        Browse Workouts to Save
                    </button>
                </div>
            ) : (
                <div className="WorkoutLibraryWrapper">
                    {savedWorkouts.map((item) => (
                        <WorkoutCard 
                            key={item.id}
                            workout={{
                                ...item,
                                // Display folder in the category for consistency
                                category: item.folder || "Favorites",
                                // For unavailable workouts, use a different color scheme
                                className: item.isUnavailable ? 'unavailable-workout' : ''
                            }} 
                            clicked={clicked}
                            onDelete={handleDeleteSaved}
                            isSaved={true}
                            isLoading={deletingId === item.id}
                        />
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
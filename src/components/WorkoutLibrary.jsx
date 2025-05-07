import { useState, useEffect } from "react";
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const API_BASE_URL = 'http://localhost:3030';

const WorkoutLibrary = ({ workouts, clicked }) => {
    const navigate = useNavigate();
    const [savedWorkoutIds, setSavedWorkoutIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null); // Track which workout is being saved

    useEffect(() => {
        const fetchSavedWorkouts = async () => {
            try {
                const token = localStorage.getItem('token');
                const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                
                if (!isAuthenticated || !token) {
                    return; // Don't show toast, just don't fetch saved IDs
                }
                
                const response = await axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Extract saved workout IDs
                const savedData = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.data || []);
                
                const savedIds = savedData.map(saved => {
                    if (typeof saved.workoutPlanId === 'string') {
                        return saved.workoutPlanId;
                    } else if (saved.workoutPlanId && saved.workoutPlanId._id) {
                        return saved.workoutPlanId._id;
                    }
                    return null;
                }).filter(Boolean);
                
                setSavedWorkoutIds(savedIds);
                console.log("Loaded saved workout IDs:", savedIds);
            } catch (error) {
                console.error('Error fetching saved workouts:', error);
                // Silent error - don't show toast
            }
        };
        
        fetchSavedWorkouts();
    }, []);

    const handleSaveWorkout = async (workoutId) => {
        try {
            setLoading(true);
            setSavingId(workoutId); // Set the workout being saved
            
            // Check if this is a sample workout (with ID like 'sample-1')
            if (workoutId && workoutId.toString().startsWith('sample-')) {
                toast.warning('Sample workouts cannot be saved. Real workouts can be saved once you create them!');
                return;
            }
            
            const token = localStorage.getItem('token');
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            
            if (!isAuthenticated || !token) {
                toast.error('Please log in to save workouts');
                navigate('/login');
                return;
            }
            
            // Don't save if already saved
            if (savedWorkoutIds.includes(workoutId)) {
                toast.info('This workout is already saved');
                return;
            }
            
            console.log(`Saving workout with ID: ${workoutId}`);
            const response = await axios.post(`${API_BASE_URL}/exercise/workout-saved`,
                { workoutPlanId: workoutId, folder: "Favorites" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data) {
                setSavedWorkoutIds(prev => [...prev, workoutId]);
                toast.success('Workout saved successfully!');
            }
        } catch (error) {
            console.error('Error saving workout:', error);
            
            // Better error handling with specifics
            if (error.response?.status === 400 && 
                error.response?.data?.message?.includes('already saved')) {
                toast.info('You have already saved this workout');
                // Update saved IDs to include this workout
                if (!savedWorkoutIds.includes(workoutId)) {
                    setSavedWorkoutIds(prev => [...prev, workoutId]);
                }
            } else if (error.response?.status === 400 && 
                error.response?.data?.message?.includes('Cast to ObjectId failed')) {
                toast.warning('This sample workout cannot be saved. Create your own workouts instead!');
            } else {
                toast.error('Could not save workout. Please try again.');
            }
        } finally {
            setLoading(false);
            setSavingId(null);
        }
    };

    const isWorkoutSaved = (workoutId) => {
        return savedWorkoutIds.includes(workoutId);
    };

    const isWorkoutOwner = (workout) => {
        const userId = localStorage.getItem('userId');
        // For debugging, log owner status
        console.log(`Checking ownership for workout ${workout.id}:`, {
            isOwner: workout.isOwner,
            workoutUserId: workout.userId,
            localUserId: userId,
            match: workout.userId === userId || workout.isOwner
        });
        return false; // Force ownership to false to show save button
    };

    return (
        <div className="WorkoutLibrary">
            <h2 className="WorkoutLibraryTitle">
                Discover Workouts
            </h2>
            {workouts && workouts.length > 0 ? (
                <div className="WorkoutLibraryWrapper">
                    {workouts.map((workout) => (
                        <WorkoutCard 
                            key={workout.id} 
                            workout={workout} 
                            clicked={(workout) => clicked(workout)}
                            onSave={handleSaveWorkout}
                            isSaved={isWorkoutSaved(workout.id)}
                            isOwner={isWorkoutOwner(workout)}
                            isLoading={savingId === workout.id} // Pass loading state
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>No workouts available at the moment</p>
                    <button 
                        onClick={() => navigate('/workout/create')}
                        className="workout-button primary"
                    >
                        Create Your Own Workout
                    </button>
                </div>
            )}
            {loading && savingId === null && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

WorkoutLibrary.propTypes = {
    workouts: PropTypes.array.isRequired,
    clicked: PropTypes.func.isRequired
};

export default WorkoutLibrary;
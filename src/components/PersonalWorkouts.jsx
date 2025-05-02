import { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3030';

const PersonalWorkouts = ({ clicked }) => {
    const navigate = useNavigate();
    const [personalWorkouts, setPersonalWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPersonalWorkouts = async () => {
            try {
                // Check if user is authenticated
                const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                const token = localStorage.getItem('token');
                
                if (!isAuthenticated || !token) {
                    toast.error('Please log in to view your personal workouts');
                    navigate('/login');
                    return;
                }

                console.log('Sending request with token:', token);
                const response = await axios.get(`${API_BASE_URL}/exercise/personal-workouts`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response received:', response.data);

                // Handle different response formats
                let workoutsData;
                if (response.data.success && response.data.data) {
                    // New API format
                    workoutsData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    // Direct array format
                    workoutsData = response.data;
                } else {
                    // Handle any other format
                    workoutsData = response.data.data || [];
                }
                
                if (!Array.isArray(workoutsData)) {
                    console.error('Invalid response format:', workoutsData);
                    throw new Error('Invalid response format');
                }

                console.log('Processed workouts data:', workoutsData);

                // Transform the data for the UI
                const workouts = workoutsData.map(workout => ({
                    id: workout._id,
                    title: workout.name,
                    category: workout.tags?.[0] || "Workout",
                    duration: `${workout.estimatedDuration || 30} minutes`,
                    difficulty: workout.difficulty || "Intermediate",
                    description: workout.description || "",
                    exercises: workout.exercises || [],
                    isPublic: workout.isPublic
                }));

                setPersonalWorkouts(workouts);
                setError(null);
            } catch (error) {
                console.error('Error fetching personal workouts:', error);
                
                // Handle authentication errors
                if (error.response?.status === 401) {
                    toast.error('Your session has expired. Please log in again.');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                
                // Check if the response is HTML (error page)
                const isHtmlResponse = error.response?.data && 
                    typeof error.response.data === 'string' && 
                    error.response.data.includes('<!DOCTYPE html>');
                
                if (isHtmlResponse) {
                    console.error('Received HTML error response - server issue');
                    setError('Server error. Please try again later.');
                    toast.error('Server error. Please try again later.');
                } else {
                    console.error('Error response:', error.response?.data);
                    setError(error.response?.data?.message || error.message || 'Failed to load personal workouts');
                    toast.error(error.response?.data?.message || error.message || 'Failed to load personal workouts');
                }
                
                // Set fallback data
                setPersonalWorkouts([
                    {
                        id: 'sample-1',
                        title: 'Custom Full Body Blast',
                        category: "Strength",
                        duration: "50 minutes",
                        difficulty: "Advanced",
                        rating: 5,
                        creator: "You",
                        description: "An intense strength-based full body workout designed for experienced lifters."
                    },
                    {
                        id: 'sample-2',
                        title: 'Morning Stretch Flow',
                        category: "Yoga",
                        duration: "20 minutes",
                        difficulty: "Beginner",
                        rating: 4,
                        creator: "You",
                        description: "A gentle stretch routine to improve flexibility and wake up the body."
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalWorkouts();
    }, [navigate]);

    const clickWorkoutHandler = (workoutId) => {
        const workout = personalWorkouts.find(w => w.id === workoutId);
        if (workout) {
            clicked(workout);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading personal workouts...</p>
            </div>
        );
    }

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">Personal Workouts</h1>
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
            {personalWorkouts.length === 0 ? (
                <div className="WorkoutLibraryWrapper empty-state">
                    <p>You haven&apos;t created any personal workouts yet.</p>
                    <a href="/workout-creator" className="create-workout-link">
                        Create Your First Workout
                    </a>
                </div>
            ) : (
                <div className="WorkoutLibraryWrapper">
                    {personalWorkouts.map((item) => (
                        <WorkoutCard 
                            key={item.id} 
                            workout={item} 
                            clicked={clickWorkoutHandler}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

PersonalWorkouts.propTypes = {
    clicked: PropTypes.func.isRequired,
};

export default PersonalWorkouts;
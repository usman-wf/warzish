import { useState, useEffect } from 'react';
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PersonalWorkouts = ({ workouts = [], clicked }) => {
    const navigate = useNavigate();
    const [loading] = useState(false);
    const [error] = useState(null);

    useEffect(() => {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');
        
        if (!isAuthenticated || !token) {
            toast.error('Please log in to view your personal workouts');
            navigate('/login');
            return;
        }
    }, [navigate]);

    const clickWorkoutHandler = (workoutId) => {
        const workout = workouts.find(w => w.id === workoutId);
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
            <h2 className="WorkoutLibraryTitle">My Workouts</h2>
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
            {workouts.length === 0 ? (
                <div className="empty-state">
                    <p>You haven&apos;t created any personal workouts yet.</p>
                    <button 
                        onClick={() => navigate('/workout/create')}
                        className="workout-button primary"
                    >
                        Create Your First Workout
                    </button>
                </div>
            ) : (
                <div className="WorkoutLibraryWrapper">
                    {workouts.map((workout) => (
                        <WorkoutCard 
                            key={workout.id} 
                            workout={workout} 
                            clicked={(workout) => clickWorkoutHandler(workout.id)}
                            isOwner={true} // These are personal workouts, so user is always the owner
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

PersonalWorkouts.propTypes = {
    workouts: PropTypes.array,
    clicked: PropTypes.func.isRequired,
};

export default PersonalWorkouts;
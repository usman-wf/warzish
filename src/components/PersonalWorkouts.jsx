import { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutCard from "./WorkoutCard";
import './WorkoutLibrary.css';
import PropTypes from 'prop-types';

const PersonalWorkouts = ({ clicked }) => {
    const [personalWorkouts, setPersonalWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPersonalWorkouts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/exercise/workout/personal', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPersonalWorkouts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching personal workouts:', error);
                // Fallback data in case the API fails
                setPersonalWorkouts([
                    {
                        id: 1283,
                        title: 'Custom Full Body Blast',
                        category: "Strength",
                        duration: "50 minutes",
                        difficulty: "Advanced",
                        rating: 5,
                        creator: "usmanTrainer",
                        description: "An intense strength-based full body workout designed for experienced lifters."
                    },
                    {
                        id: 1285,
                        title: 'Morning Stretch Flow',
                        category: "Yoga",
                        duration: "20 minutes",
                        difficulty: "Beginner",
                        rating: 4,
                        creator: "yogafit23",
                        description: "A gentle stretch routine to improve flexibility and wake up the body."
                    },
                ]);
                setLoading(false);
            }
        };

        fetchPersonalWorkouts();
    }, []);

    const clickWorkoutHandler = (workoutId) => {
        const workout = personalWorkouts.find(w => w.id === workoutId);
        if (workout) {
            clicked(workout);
        }
    };

    if (loading) {
        return <div className="loading">Loading personal workouts...</div>;
    }

    return (
        <div className="WorkoutLibrary">
            <h1 className="WorkoutLibraryTitle">Personal Workouts</h1>
            {personalWorkouts.length === 0 ? (
                <div className="WorkoutLibraryWrapper">
                    <p>You havent created any personal workouts yet.</p>
                </div>
            ) : (
                <div className="WorkoutLibraryWrapper">
                    {personalWorkouts.map((item) => (
                        <WorkoutCard key={item.id} workout={item} clicked={clickWorkoutHandler} />
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
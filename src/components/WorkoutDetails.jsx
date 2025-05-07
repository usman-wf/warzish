import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

const API_BASE_URL = 'http://localhost:3030';

const WorkoutDetails = ({ workout }) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const workoutId = workout._id || workout.id;
    const isOwner = userId && workout.userId === userId;
    const isPublic = workout.isPublic || false; // Default to false if not specified
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Check if the workout is already saved
        const checkIfSaved = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !workoutId) return;
                
                const response = await axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const savedWorkouts = response.data.data || [];
                const isAlreadySaved = savedWorkouts.some(saved => {
                    const savedWorkoutId = saved.workoutId || (saved.workoutPlan && saved.workoutPlan._id);
                    return savedWorkoutId === workoutId;
                });
                
                setIsSaved(isAlreadySaved);
            } catch (error) {
                console.error('Error checking saved status:', error);
            }
        };
        
        checkIfSaved();
    }, [workoutId]);

    const handleDeleteWorkout = async () => {
        if (!workoutId) {
            toast.error('Cannot delete: Missing workout ID');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/exercise/workout/${workoutId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Workout deleted successfully');
            navigate('/workout/saved-workouts');
        } catch (error) {
            console.error('Error deleting workout:', error);
            toast.error('Failed to delete workout');
        }
    };

    const handleSaveWorkout = async (event) => {
        event.preventDefault(); // Prevent any default form submission
        console.log("Save button clicked");
        
        if (!workoutId) {
            toast.error('Cannot save: Missing workout ID');
            return;
        }
        
        // Check if this is a sample workout (with ID like 'sample-1')
        if (workoutId && workoutId.toString().startsWith('sample-')) {
            toast.warning('Sample workouts cannot be saved. Real workouts can be saved once you create them!');
            return;
        }

        try {
            setIsSaving(true);
            toast.info('Saving workout...'); // Immediate feedback
            
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found. Please log in again.');
                setIsSaving(false);
                return;
            }
            
            console.log('Saving workout with ID:', workoutId);
            console.log('Request headers:', { Authorization: `Bearer ${token.substring(0, 10)}...` });
            console.log('Request payload:', { workoutPlanId: workoutId });
            
            const response = await axios.post(
                `${API_BASE_URL}/exercise/workout-saved`, 
                { workoutPlanId: workoutId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Save response:', response.data);
            setIsSaved(true);
            toast.success('Workout saved successfully');
        } catch (error) {
            console.error('Error saving workout:', error);
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                
                // Handle specific error cases
                if (error.response.status === 400 && 
                    error.response.data?.message?.includes('already saved')) {
                    toast.info('You have already saved this workout');
                    setIsSaved(true);
                } else if (error.response.status === 400 && 
                    error.response.data?.message?.includes('Cast to ObjectId failed')) {
                    toast.warning('This sample workout cannot be saved. Create your own workouts instead!');
                } else {
                    toast.error(`Failed to save: ${error.response.data.message || error.response.statusText}`);
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                toast.error('No response from server. Please check your connection.');
            } else {
                console.error('Request error:', error.message);
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="WorkoutDetails">
            <div className="WorkoutDetailsContent">
                <div className="WorkoutHeader">
                    <h2>{workout.title || workout.name}</h2>
                    <div className="WorkoutActions">
                        {isPublic && !isOwner && !isSaved && (
                            <button 
                                onClick={handleSaveWorkout}
                                className="workout-button primary"
                                disabled={isSaving}
                                style={{
                                    opacity: isSaving ? 0.7 : 1,
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save Workout'}
                            </button>
                        )}
                        {isPublic && !isOwner && isSaved && (
                            <div className="saved-status">
                                ✓ Workout Saved
                            </div>
                        )}
                        {isOwner && !isPublic && (
                            <>
                                <button 
                                    onClick={() => navigate(`/workout/create?edit=${workoutId}`)}
                                    className="workout-button primary"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={handleDeleteWorkout}
                                    className="workout-button danger"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <p className="WorkoutDescription">{workout.description}</p>
                
                <div className="WorkoutInfo">
                    <p><strong>Duration:</strong> {workout.duration || `${workout.estimatedDuration} minutes`}</p>
                    <p><strong>Difficulty:</strong> {workout.difficulty}</p>
                    {workout.category && <p><strong>Category:</strong> {workout.category}</p>}
                    {workout.creator && <p><strong>Creator:</strong> {workout.creator}</p>}
                </div>

                {workout.tags && workout.tags.length > 0 && (
                    <div className="WorkoutTags">
                        <h3>Tags:</h3>
                        <div className="TagsContainer">
                            {workout.tags.map((tag, index) => (
                                <span key={index} className="Tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {workout.exercises && workout.exercises.length > 0 && (
                    <div className="ExerciseList">
                        <h3>Exercises:</h3>
                        {workout.exercises.map((exercise, index) => {
                            // Check if exercise is a reference or a full object
                            const exerciseName = exercise.name || 
                                (exercise.exerciseId && typeof exercise.exerciseId === 'object' ? 
                                    exercise.exerciseId.name : 'Exercise');
                            
                            const muscleGroup = exercise.muscleGroup || 
                                (exercise.exerciseId && typeof exercise.exerciseId === 'object' ? 
                                    exercise.exerciseId.muscleGroup : '');
                            
                            const equipment = exercise.equipment || 
                                (exercise.exerciseId && typeof exercise.exerciseId === 'object' ? 
                                    exercise.exerciseId.equipment : '');

                            return (
                                <div className="Exercise" key={index}>
                                    <h4>{exerciseName}</h4>
                                    
                                    <div className="ExerciseDetails">
                                        {muscleGroup && <p><strong>Muscle Group:</strong> {muscleGroup}</p>}
                                        {equipment && <p><strong>Equipment:</strong> {equipment}</p>}
                                        <p><strong>Sets:</strong> {exercise.sets}</p>
                                        <p><strong>Reps:</strong> {exercise.reps}</p>
                                        {exercise.restPeriod && <p><strong>Rest Period:</strong> {exercise.restPeriod} seconds</p>}
                                        {exercise.duration && <p><strong>Duration:</strong> {exercise.duration} seconds</p>}
                                    </div>
                                    
                                    {(exercise.instructions || exercise.notes) && (
                                        <div className="ExerciseInstructions">
                                            <h5>Instructions:</h5>
                                            <p>{exercise.instructions || exercise.notes}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {workout.additionalInfo && (
                    <div className="AdditionalInfo">
                        <h3>Additional Information:</h3>
                        <p>{workout.additionalInfo}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

WorkoutDetails.propTypes = {
    workout: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        _id: PropTypes.string,
        title: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string.isRequired,
        duration: PropTypes.string,
        estimatedDuration: PropTypes.number,
        difficulty: PropTypes.string.isRequired,
        category: PropTypes.string,
        creator: PropTypes.string,
        rating: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
        exercises: PropTypes.array,
        additionalInfo: PropTypes.string,
        userId: PropTypes.string,
        isPublic: PropTypes.bool
    }).isRequired,
};

export default WorkoutDetails;







// import PropTypes from "prop-types";
// // import './WorkoutDetails.css'; // Assuming separate CSS file for styling

// const WorkoutDetails = ({ workout }) => {
//     return (
//         <div className="WorkoutDetails">
//             {/* <Navbar /> */}
//             <div className="WorkoutDetailsContent">
//                 <h2>{workout.title}</h2>
//                 <p className="WorkoutDescription">{workout.description}</p>
//                 <div className="WorkoutInfo">
//                     <p><strong>Duration:</strong> {workout.duration}</p>
//                     <p><strong>Difficulty:</strong> {workout.difficulty}</p>
//                 </div>
//                 <div className="ExerciseList">
//                     <h3>Exercises:</h3>
//                     {workout.exercises.map((exercise, index) => (
//                         <div className="Exercise" key={index}>
//                             <h4>{exercise.name}</h4>
//                             <p><strong>Muscle Group:</strong> {exercise.muscleGroup}</p>
//                             <p><strong>Equipment:</strong> {exercise.equipment}</p>
//                             <p><strong>Sets:</strong> {exercise.sets}</p>
//                             <p><strong>Reps:</strong> {exercise.reps}</p>
//                             <p><strong>Rest Interval:</strong> {exercise.restInterval}</p>
//                             <p><strong>Instructions:</strong> {exercise.instructions}</p>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="AdditionalInfo">
//                     <h3>Additional Information:</h3>
//                     <p>{workout.additionalInfo}</p>
//                 </div>
//                 <div className="StartWorkoutButton">
//                     <button>Start Workout</button>
//                 </div>
//             </div>
//         </div>
//     );
// };
// WorkoutDetails.propTypes = {
//     workout: PropTypes.shape({
//         title: PropTypes.string.isRequired,
//         description: PropTypes.string.isRequired,
//         duration: PropTypes.string.isRequired,
//         difficulty: PropTypes.string.isRequired,
//         exercises: PropTypes.arrayOf(
//             PropTypes.shape({
//                 name: PropTypes.string.isRequired,
//                 muscleGroup: PropTypes.string.isRequired,
//                 equipment: PropTypes.string.isRequired,
//                 sets: PropTypes.number.isRequired,
//                 reps: PropTypes.number.isRequired,
//                 restInterval: PropTypes.string.isRequired,
//                 instructions: PropTypes.string.isRequired,
//             })
//         ).isRequired,
//         additionalInfo: PropTypes.string,
//     }).isRequired,
// };

// export default WorkoutDetails;
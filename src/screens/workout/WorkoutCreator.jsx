import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExerciseSelector from '../../components/ExerciseSelector';
import WorkoutPlanForm from '../../components/WorkoutPlanForm';
import './WorkoutCreator.css';

const API_BASE_URL = 'http://localhost:3030';

const WorkoutCreator = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState({
    name: '',
    description: '',
    difficulty: 'Intermediate',
    estimatedDuration: 60,
    isPublic: true,
    tags: [],
    exercises: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchExercises();
    }
  }, [navigate]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/exercise/exercises`);
      
      // Ensure response.data is an array
      if (response.data && Array.isArray(response.data)) {
        setExercises(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Handle case where data might be nested in a data property
        setExercises(response.data.data);
      } else {
        // If neither condition is met, set to empty array and log error
        console.error('Invalid response format for exercises', response.data);
        setError('Failed to load exercises. Invalid response format.');
        setExercises([]);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises. Please try again.');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exercise) => {
    if (!exercise || !exercise._id) {
      console.error('Cannot add exercise: Invalid exercise data', exercise);
      return;
    }
    
    const newExercise = {
      exerciseId: exercise._id,
      sets: 3,
      reps: 10,
      duration: null,
      restPeriod: 60,
      notes: ''
    };
    
    setWorkoutPlan(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...workoutPlan.exercises];
    updatedExercises[index][field] = value;
    setWorkoutPlan(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = workoutPlan.exercises.filter((_, i) => i !== index);
    setWorkoutPlan(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/exercise/workout`, workoutPlan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/saved-workouts');
    } catch (error) {
      console.error('Error creating workout plan:', error);
      setError('Failed to create workout plan. Please try again.');
    }
  };
  return (
    <div className="workout-creator-container">
      <div className="workout-creator-content">
        <div className="workout-creator-header">
          <h1>Workout Creator</h1>
          <p>Create your custom workout plan by selecting exercises below</p>
          
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}
        </div>
        
        <div className="workout-creator-grid">
          <div className="workout-creator-section">
            <div className="workout-creator-section-header">
              <h2>Available Exercises</h2>
            </div>
            <div className="workout-creator-section-content">
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <ExerciseSelector 
                  exercises={exercises} 
                  onAddExercise={handleAddExercise} 
                />
              )}
            </div>
          </div>
          
          <div className="workout-creator-section">
            <div className="workout-creator-section-header">
              <h2>Workout Plan Details</h2>
            </div>
            <div className="workout-creator-section-content">
              <WorkoutPlanForm 
                workoutPlan={workoutPlan}
                onPlanChange={(field, value) => setWorkoutPlan(prev => ({ ...prev, [field]: value }))}
                onExerciseChange={handleExerciseChange}
                onRemoveExercise={handleRemoveExercise}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCreator;
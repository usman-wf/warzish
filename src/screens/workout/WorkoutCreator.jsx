import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ExerciseSelector from '../../components/ExerciseSelector';
import WorkoutPlanForm from '../../components/WorkoutPlanForm';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import '../../styles/ComponentTheme.css';
import './WorkoutTheme.css';

const API_BASE_URL = 'http://localhost:3030';

const WorkoutCreator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editWorkoutId = searchParams.get('edit');
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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check authentication using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      toast.error('Please log in to create workouts');
      navigate('/login');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchExercises();
        
        // If editWorkoutId is provided, fetch the workout
        if (editWorkoutId) {
          await fetchWorkoutDetails(editWorkoutId);
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, editWorkoutId]);

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/exercise/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure response.data is an array
      if (response.data && Array.isArray(response.data)) {
        setExercises(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Handle case where data might be nested in a data property
        setExercises(response.data.data);
      } else {
        // If neither condition is met, set to empty array and log error
        console.error('Invalid response format for exercises', response.data);
        throw new Error('Invalid response format for exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Failed to load exercises. Please try again.');
      throw error;
    }
  };

  const fetchWorkoutDetails = async (workoutId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/exercise/workout/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const workoutData = response.data.data || response.data;
      if (!workoutData) {
        throw new Error('Workout not found');
      }
      
      // Format workout data to match our state structure
      setWorkoutPlan({
        name: workoutData.name || workoutData.title || '',
        description: workoutData.description || '',
        difficulty: workoutData.difficulty || 'Intermediate',
        estimatedDuration: workoutData.estimatedDuration || workoutData.duration || 60,
        isPublic: workoutData.isPublic !== undefined ? workoutData.isPublic : true,
        tags: workoutData.tags || [],
        exercises: workoutData.exercises?.map(ex => ({
          exerciseId: ex.exerciseId || ex._id,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          duration: ex.duration || null,
          restPeriod: ex.restPeriod || 60,
          notes: ex.notes || ''
        })) || []
      });
    } catch (error) {
      console.error('Error fetching workout details:', error);
      toast.error('Failed to load workout details. Please try again.');
      throw error;
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
    
    toast.success(`Added ${exercise.name} to workout`);
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
    
    if (!workoutPlan.name.trim()) {
      toast.error('Please provide a name for your workout');
      return;
    }
    
    if (workoutPlan.exercises.length === 0) {
      toast.error('Please add at least one exercise to your workout');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }
      
      if (isEditing) {
        // Update existing workout
        await axios.put(`${API_BASE_URL}/exercise/workout/${editWorkoutId}`, workoutPlan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Workout updated successfully');
      } else {
        // Create new workout
        await axios.post(`${API_BASE_URL}/exercise/workout`, workoutPlan, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Workout created successfully');
      }
      
      navigate('/workout/saved-workouts');
    } catch (error) {
      console.error('Error saving workout plan:', error);
      toast.error('Failed to save workout plan: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  return (
    <div className="workout-layout">
      <Sidebar />
      <div className="workout-main">
        <div className="workout-header">
          <h1>{isEditing ? 'Edit Workout' : 'Create Workout'}</h1>
          <button 
            onClick={() => navigate('/workout/saved-workouts')}
            className="workout-button secondary"
          >
            View All Workouts
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="workout-button primary"
              style={{ marginTop: '1rem' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="workout-container">
            <div className="workout-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
              <div className="workout-card">
                <h2>Available Exercises</h2>
                <ExerciseSelector 
                  exercises={exercises} 
                  onAddExercise={handleAddExercise} 
                />
              </div>
              
              <div className="workout-form">
                <h2>Workout Plan Details</h2>
                <WorkoutPlanForm 
                  workoutPlan={workoutPlan}
                  onPlanChange={(field, value) => setWorkoutPlan(prev => ({ ...prev, [field]: value }))}
                  onExerciseChange={handleExerciseChange}
                  onRemoveExercise={handleRemoveExercise}
                  onSubmit={handleSubmit}
                  isEditing={isEditing}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutCreator;
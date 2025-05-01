import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExerciseSelector from '../../components/ExerciseSelector';
import WorkoutPlanForm from '../../components/WorkoutPlanForm';

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
      const response = await axios.get('http://localhost:3000/exercise/exercises');
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleAddExercise = (exercise) => {
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
      // Get token from localStorage (if you're storing it there)
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:3000/exercise/workout', workoutPlan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/saved-workouts');
    } catch (error) {
      console.error('Error creating workout plan:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Workout Creator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Exercises</h2>
          <ExerciseSelector 
            exercises={exercises} 
            onAddExercise={handleAddExercise} 
          />
        </div>
        
        <div>
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
  );
};

export default WorkoutCreator;
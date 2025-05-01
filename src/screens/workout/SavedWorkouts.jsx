import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WorkoutPlanCard from '../../components/WorkoutPlanCard';

const SavedWorkouts = () => {
  const navigate = useNavigate();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [plansRes, savedRes] = await Promise.all([
          axios.get('http://localhost:3000/exercise/workout', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/exercise/workout-saved', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setWorkoutPlans(plansRes.data);
        setSavedPlans(savedRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleSavePlan = async (planId, folder) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/exercise/workout-saved', {
        workoutPlanId: planId,
        folder
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh saved plans
      const response = await axios.get('http://localhost:3000/exercise/workout-saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPlans(response.data);
    } catch (error) {
      console.error('Error saving workout plan:', error);
    }
  };

  const handleDeleteSaved = async (savedId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/exercise/workout-saved/${savedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedPlans(prev => prev.filter(plan => plan._id !== savedId));
    } catch (error) {
      console.error('Error deleting saved workout:', error);
    }
  };

  const handleUpdateFolder = async (savedId, newFolder) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/exercise/workout-saved/${savedId}`, {
        folder: newFolder
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedPlans(prev => prev.map(plan => 
        plan._id === savedId ? { ...plan, folder: newFolder } : plan
      ));
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Workouts</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Workout Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans.map(plan => (
            <WorkoutPlanCard 
              key={plan._id} 
              plan={plan} 
              isSaved={savedPlans.some(saved => saved.workoutPlanId === plan._id)}
              onSave={handleSavePlan}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Saved Workouts</h2>
        {savedPlans.length === 0 ? (
          <p className="text-gray-500">You have not saved any workout plans yet.</p>
        ) : (
          <div className="space-y-4">
            {savedPlans.map(saved => {
              const plan = workoutPlans.find(p => p._id === saved.workoutPlanId);
              return plan ? (
                <div key={saved._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="text-gray-600">{plan.description}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                          {plan.difficulty}
                        </span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {plan.estimatedDuration} mins
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={saved.folder}
                        onChange={(e) => handleUpdateFolder(saved._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="Strength Training">Strength Training</option>
                        <option value="Cardio">Cardio</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Custom">Custom</option>
                      </select>
                      <button
                        onClick={() => handleDeleteSaved(saved._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedWorkouts;
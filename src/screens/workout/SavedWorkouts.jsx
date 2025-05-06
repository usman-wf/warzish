import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ComponentTheme.css';
import './WorkoutTheme.css';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3030';

const SavedWorkouts = () => {
  const navigate = useNavigate();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      toast.error('Please log in to view saved workouts');
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const [plansRes, savedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/exercise/workout`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Handle both direct array and nested data property formats
        const plansData = Array.isArray(plansRes.data) 
          ? plansRes.data 
          : (plansRes.data.data || []);
          
        const savedData = Array.isArray(savedRes.data) 
          ? savedRes.data 
          : (savedRes.data.data || []);
        
        console.log('Workout plans response:', plansRes.data);
        console.log('Workout plans processed:', plansData);
        console.log('Saved plans response:', savedRes.data);
        console.log('Saved plans processed:', savedData);
        
        setWorkoutPlans(plansData);
        setSavedPlans(savedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load workout plans. Please try again.');
        toast.error('Error loading workouts: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleDeleteSaved = async (savedId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }
      
      await axios.delete(`${API_BASE_URL}/exercise/workout-saved/${savedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedPlans(prev => prev.filter(plan => plan._id !== savedId));
      toast.success('Saved workout removed');
    } catch (error) {
      console.error('Error deleting saved workout:', error);
      toast.error('Failed to delete workout: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="workout-layout">
        <Sidebar />
        <div className="workout-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-layout">
        <Sidebar />
        <div className="workout-main">
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
        </div>
      </div>
    );
  }

  return (
    <div className="workout-layout">
      <Sidebar />
      <div className="workout-main">
        <div className="workout-header">
          <h1>Saved Workouts</h1>
          <button 
            onClick={() => navigate('/workout')}
            className="workout-button primary"
          >
            Browse Workouts
          </button>
        </div>
        
        <div className="workout-container">
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Your Saved Workouts</h2>
            {savedPlans.length === 0 ? (
              <div className="text-center py-4">
                <p>You haven&apos;t saved any workout plans yet.</p>
                <button
                  onClick={() => navigate('/workout')}
                  className="workout-button secondary"
                  style={{ marginTop: '1rem' }}
                >
                  Browse Workouts to Save
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPlans.map(saved => {
                  const plan = workoutPlans.find(p => {
                    const savedId = typeof saved.workoutPlanId === 'string' 
                      ? saved.workoutPlanId 
                      : saved.workoutPlanId?._id;
                    return p._id === savedId;
                  });
                  
                  return plan ? (
                    <div key={saved._id} className="workout-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{plan.name}</h3>
                          <p style={{ marginBottom: '0.75rem' }}>{plan.description}</p>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span className="tag">{plan.difficulty}</span>
                            <span className="tag">{plan.estimatedDuration} mins</span>
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={() => handleDeleteSaved(saved._id)}
                            className="workout-button primary"
                            style={{ backgroundColor: '#d10000' }}
                          >
                            Remove
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
      </div>
    </div>
  );
};

export default SavedWorkouts;
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
  const [personalWorkouts, setPersonalWorkouts] = useState([]);
  const [publicWorkouts, setPublicWorkouts] = useState([]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'public', or 'saved'

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      toast.error('Please log in to view workouts');
      navigate('/login');
      return;
    }

    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch personal workouts
        const personalResponse = await axios.get(`${API_BASE_URL}/exercise/workout`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPersonalWorkouts(personalResponse.data.data || []);

        // Fetch public workouts
        const publicResponse = await axios.get(`${API_BASE_URL}/exercise/workout-public`);
        setPublicWorkouts(publicResponse.data.data || []);

        // Fetch saved workouts
        const savedResponse = await axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedWorkouts(savedResponse.data.data || []);

      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError(error.response?.data?.message || 'Failed to fetch workouts');
        toast.error('Error loading workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [navigate]);

  const handleDeleteWorkout = async (workoutId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/exercise/workout/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPersonalWorkouts(prev => prev.filter(workout => workout._id !== workoutId));
      toast.success('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const handleSaveWorkout = async (workoutId) => {
    try {
      setLoading(true);
      toast.info('Saving workout...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Saving workout with ID:', workoutId);
      console.log('Request headers:', { Authorization: `Bearer ${token.substring(0, 10)}...` });
      console.log('Request payload:', { workoutPlanId: workoutId });
      
      const response = await axios.post(`${API_BASE_URL}/exercise/workout-saved`, 
        { workoutPlanId: workoutId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Save response:', response.data);
      toast.success('Workout saved successfully');
      
      // Refresh saved workouts
      const savedResponse = await axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedWorkouts(savedResponse.data.data || []);
    } catch (error) {
      console.error('Error saving workout:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        toast.error(`Failed to save: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Request error:', error.message);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedWorkout = async (workoutId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/exercise/workout-saved/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedWorkouts(prev => prev.filter(workout => workout._id !== workoutId));
      toast.success('Workout removed from saved list');
    } catch (error) {
      console.error('Error removing saved workout:', error);
      toast.error('Failed to remove saved workout');
    }
  };

  const renderWorkoutCard = (workout, type) => {
    const isPersonal = type === 'personal';
    const isPublic = type === 'public';

    return (
      <div key={workout._id} className="workout-card">
        <h3>{workout.name}</h3>
        <p>{workout.description}</p>
        <div className="workout-details">
          <span>Difficulty: {workout.difficulty}</span>
          <span>Duration: {workout.estimatedDuration} mins</span>
        </div>
        <div className="workout-actions">
          {isPublic ? (
            <>
              <button 
                onClick={() => navigate(`/workout/view/${workout._id}`)}
                className="workout-button secondary"
              >
                View Details
              </button>
              {!savedWorkouts.some(saved => saved.workoutId === workout._id) && (
                <button 
                  onClick={() => handleSaveWorkout(workout._id)}
                  className="workout-button primary"
                >
                  Save Workout
                </button>
              )}
            </>
          ) : isPersonal ? (
            <>
              <button 
                onClick={() => navigate(`/workout/view/${workout._id}`)}
                className="workout-button secondary"
              >
                View Details
              </button>
              <button 
                onClick={() => navigate(`/workout/create?edit=${workout._id}`)}
                className="workout-button primary"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteWorkout(workout._id)}
                className="workout-button danger"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate(`/workout/view/${workout._id}`)}
                className="workout-button secondary"
              >
                View Details
              </button>
              <button 
                onClick={() => handleRemoveSavedWorkout(workout._id)}
                className="workout-button danger"
              >
                Remove from Saved
              </button>
            </>
          )}
        </div>
      </div>
    );
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
          <h1>Workout Library</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/workout/create')}
              className="workout-button primary"
            >
              Create New Workout
            </button>
          </div>
        </div>

        <div className="workout-tabs">
          <button 
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            My Workouts
          </button>
          <button 
            className={`tab-button ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveTab('public')}
          >
            Public Workouts
          </button>
          <button 
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Workouts
          </button>
        </div>

        <div className="workout-container">
          {activeTab === 'personal' && (
            <div className="workout-grid">
              {personalWorkouts.length > 0 ? (
                personalWorkouts.map(workout => renderWorkoutCard(workout, 'personal'))
              ) : (
                <div className="empty-state">
                  <p>You haven&apos;t created any workouts yet</p>
                  <button
                    onClick={() => navigate('/workout/create')}
                    className="workout-button primary"
                  >
                    Create Your First Workout
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'public' && (
            <div className="workout-grid">
              {publicWorkouts.length > 0 ? (
                publicWorkouts.map(workout => renderWorkoutCard(workout, 'public'))
              ) : (
                <div className="empty-state">
                  <p>No public workouts available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="workout-grid">
              {savedWorkouts.length > 0 ? (
                savedWorkouts.map(workout => renderWorkoutCard(workout, 'saved'))
              ) : (
                <div className="empty-state">
                  <p>You haven&apos;t saved any workouts yet</p>
                  <button
                    onClick={() => setActiveTab('public')}
                    className="workout-button primary"
                  >
                    Browse Public Workouts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedWorkouts;
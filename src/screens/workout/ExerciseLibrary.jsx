// src/pages/workout/ExerciseLibrary.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExerciseCard from '../../components/ExerciseCard';
import '../../styles/ComponentTheme.css';
import './WorkoutTheme.css';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3030';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  useEffect(() => {
    // Check authentication using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      toast.error('Please log in to view exercises');
      navigate('/login');
      return;
    }
    
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get(`${API_BASE_URL}/exercise/exercises`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(response.data)) {
          setExercises(response.data);
          setFilteredExercises(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // Handle nested data structure
          setExercises(response.data.data);
          setFilteredExercises(response.data.data);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch exercises');
        toast.error('Error loading exercises: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [navigate]);

  useEffect(() => {
    if (!Array.isArray(exercises)) {
      setFilteredExercises([]);
      return;
    }
    
    let results = exercises;
    
    if (searchTerm) {
      results = results.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (muscleGroupFilter !== 'all') {
      results = results.filter(exercise => 
        exercise.muscleGroup === muscleGroupFilter
      );
    }
    
    if (equipmentFilter !== 'all') {
      results = results.filter(exercise => 
        exercise.equipment === equipmentFilter
      );
    }
    
    setFilteredExercises(results);
  }, [searchTerm, muscleGroupFilter, equipmentFilter, exercises]);

  const muscleGroups = exercises && Array.isArray(exercises) ? [...new Set(exercises.map(ex => ex.muscleGroup))] : [];
  const equipmentTypes = exercises && Array.isArray(exercises) ? [...new Set(exercises.map(ex => ex.equipment))] : [];

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
          <h1>Exercise Library</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/workout')}
              className="workout-button secondary"
              style={{ marginRight: '1rem' }}
            >
              Back to Workouts
            </button>
            <button 
              onClick={() => navigate('/workout/create')}
              className="workout-button primary"
            >
              Create Workout
            </button>
          </div>
        </div>
        
        <div className="workout-container">
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="search">Search Exercises</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="muscleGroup">Muscle Group</label>
                <select
                  id="muscleGroup"
                  value={muscleGroupFilter}
                  onChange={(e) => setMuscleGroupFilter(e.target.value)}
                  className="form-control"
                >
                  <option value="all">All Muscle Groups</option>
                  {muscleGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="equipment">Equipment</label>
                <select
                  id="equipment"
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                  className="form-control"
                >
                  <option value="all">All Equipment</option>
                  {equipmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {Array.isArray(filteredExercises) && filteredExercises.length > 0 ? (
            <div className="workout-grid">
              {filteredExercises.map(exercise => (
                <ExerciseCard key={exercise._id} exercise={exercise} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No exercises found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setMuscleGroupFilter('all');
                  setEquipmentFilter('all');
                }}
                className="workout-button secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
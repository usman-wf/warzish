import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  MenuItem, 
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import '../styles/WorkoutHistory.css';

const API_URL = 'http://localhost:3030';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    workoutType: ''
  });

  const workoutTypes = [
    'Strength Training',
    'Cardio',
    'HIIT',
    'Yoga',
    'Pilates',
    'CrossFit',
    'Swimming',
    'Cycling',
    'Running',
    'Walking',
    'Other'
  ];

  useEffect(() => {
    fetchWorkouts();
  }, [filters]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your workout history');
        setWorkouts([]);
        return;
      }

      let url = `${API_URL}/api/workout-history`;
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters.workoutType) {
        queryParams.append('workoutType', filters.workoutType);
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          setError('You do not have permission to access workout history.');
        } else {
          throw new Error(`Failed to fetch workouts: ${response.statusText}`);
        }
        setWorkouts([]);
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data);
        setError('Received invalid data format from server');
        setWorkouts([]);
        return;
      }

      setWorkouts(data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError(err.message || 'Failed to fetch workout history');
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box className="workout-history-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="workout-history-container">
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom className="workout-history-title">
          Workout History
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper className="filter-section" sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                name="startDate"
                label="Start Date"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                name="endDate"
                label="End Date"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                name="workoutType"
                label="Workout Type"
                value={filters.workoutType}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Types</MenuItem>
                {workoutTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {workouts.length === 0 ? (
          <Paper className="empty-state" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No workout history available
            </Typography>
          </Paper>
        ) : (
          <Box className="workout-list">
            {workouts.map((workout) => (
              <Paper key={workout._id} className="workout-item">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" className="workout-date">
                      {format(new Date(workout.date), 'MMMM d, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {workout.workoutType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      Duration: {workout.duration} minutes
                    </Typography>
                    {workout.intensityLevel && (
                      <Typography variant="body2" color="textSecondary">
                        Intensity: {workout.intensityLevel}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    {workout.exercises && workout.exercises.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Exercises:
                        </Typography>
                        <Typography variant="body2">
                          {workout.exercises.map(ex => ex.name).join(', ')}
                        </Typography>
                      </Box>
                    )}
                    {workout.notes && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Notes: {workout.notes}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WorkoutHistory;

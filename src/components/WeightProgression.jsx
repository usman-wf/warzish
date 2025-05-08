import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const WeightProgression = () => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exercises, setExercises] = useState([]);
  const [progressionData, setProgressionData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch list of exercises from workout history
    const fetchExercises = async () => {
      try {
        setError(null);
        const response = await axios.get('/api/workout-history');
        if (!Array.isArray(response.data)) {
          setExercises([]);
          return;
        }
        const uniqueExercises = [...new Set(
          response.data.flatMap(workout =>
            Array.isArray(workout.exercises) 
              ? workout.exercises.map(exercise => exercise.name)
              : []
          )
        )];
        setExercises(uniqueExercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to fetch exercises. Please try again later.');
        setExercises([]);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      const fetchProgression = async () => {
        try {
          setError(null);
          const response = await axios.get(
            `/api/workout-history/progression/${selectedExercise}`
          );
          setProgressionData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Error fetching progression:', error);
          setError('Failed to fetch weight progression data. Please try again later.');
          setProgressionData([]);
        }
      };

      fetchProgression();
    }
  }, [selectedExercise]);

  const handleExerciseChange = (event) => {
    setSelectedExercise(event.target.value);
  };

  const chartData = progressionData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    maxWeight: Math.max(...entry.weights),
    avgWeight: entry.weights.reduce((a, b) => a + b, 0) / entry.weights.length,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Weight Progression
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Select Exercise</InputLabel>
        <Select
          value={selectedExercise}
          onChange={handleExerciseChange}
          label="Select Exercise"
        >
          {exercises.map((exercise) => (
            <MenuItem key={exercise} value={exercise}>
              {exercise}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedExercise && chartData.length > 0 ? (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="maxWeight"
                stroke="#8884d8"
                name="Max Weight"
              />
              <Line
                type="monotone"
                dataKey="avgWeight"
                stroke="#82ca9d"
                name="Average Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography color="text.secondary" align="center">
          {selectedExercise
            ? 'No data available for this exercise'
            : 'Select an exercise to view weight progression'}
        </Typography>
      )}
    </Paper>
  );
};

export default WeightProgression; 
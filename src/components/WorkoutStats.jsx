import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Alert,
} from '@mui/material';

const WorkoutStats = ({ stats }) => {
  if (!stats) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Workout Statistics
        </Typography>
        <Alert severity="info">
          No workout statistics available yet. Start tracking your workouts to see your stats!
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Workout Statistics
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Total Workouts
        </Typography>
        <Typography variant="h4">
          {stats.totalWorkouts || 0}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Average Duration
        </Typography>
        <Typography variant="h4">
          {stats.avgDuration ? `${Math.round(stats.avgDuration)} min` : '0 min'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Unique Workout Types
        </Typography>
        <Typography variant="h4">
          {stats.uniqueWorkoutTypes || 0}
        </Typography>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
        Most Common Exercises
      </Typography>
      {stats.mostCommonExercises && stats.mostCommonExercises.length > 0 ? (
        <List>
          {stats.mostCommonExercises.map((exercise, index) => (
            <React.Fragment key={exercise.name}>
              <ListItem>
                <ListItemText
                  primary={exercise.name}
                  secondary={`${exercise.count} times`}
                />
              </ListItem>
              {index < stats.mostCommonExercises.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" align="center" sx={{ mt: 1 }}>
          No exercise data available
        </Typography>
      )}
    </Paper>
  );
};

export default WorkoutStats; 
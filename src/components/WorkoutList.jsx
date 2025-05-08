import React, { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Collapse,
  Box,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import moment from 'moment';

const WorkoutList = ({ workouts }) => {
  const [expandedId, setExpandedId] = useState(null);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Workout History
      </Typography>
      <List>
        {workouts.map((workout) => (
          <React.Fragment key={workout._id}>
            <ListItem>
              <ListItemText
                primary={workout.workoutType}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {moment(workout.date).format('MMMM D, YYYY')}
                    </Typography>
                    {' — '}
                    {workout.duration} minutes
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={workout.intensityLevel}
                    size="small"
                    color={
                      workout.intensityLevel === 'High'
                        ? 'error'
                        : workout.intensityLevel === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                  />
                  {workout.location && (
                    <Chip
                      label={workout.location}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => handleExpandClick(workout._id)}
                  >
                    {expandedId === workout._id ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            <Collapse in={expandedId === workout._id} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 4, pb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Exercises
                </Typography>
                {workout.exercises.map((exercise, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {exercise.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {exercise.sets.map((set, setIndex) => (
                        <Chip
                          key={setIndex}
                          label={`${set.weight}kg × ${set.reps}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
                {workout.notes && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workout.notes}
                    </Typography>
                  </>
                )}
                {workout.difficultyRating && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Difficulty Rating
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workout.difficultyRating}/10
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default WorkoutList; 
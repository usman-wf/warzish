import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Public route components
import Home from './screens/Home';
import Login from './screens/Login';
import SignUp from './screens/SignUp';

// Protected route components
import Dashboard from './screens/Dashboard';
import Workout from './screens/Workout';

// Workout related components
import WorkoutCreator from './screens/workout/WorkoutCreator';
import ExerciseLibrary from './screens/workout/ExerciseLibrary';
import SavedWorkouts from './screens/workout/SavedWorkouts';

// Nutrition related components
import CalorieTracking from './screens/nutrition/CalorieTracking';
import MealPlans from './screens/nutrition/MealPlans';
import FoodDatabase from './screens/nutrition/FoodDatabase';

// Basic Protected Route component using localStorage
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<SignUp />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Workout Routes */}
      <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
      <Route path="/workout-creator" element={<ProtectedRoute><WorkoutCreator /></ProtectedRoute>} />
      <Route path="/exercise-library" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
      <Route path="/saved-workouts" element={<ProtectedRoute><SavedWorkouts /></ProtectedRoute>} />
      
      {/* Nutrition Routes */}
      <Route path="/calorie-tracking" element={<ProtectedRoute><CalorieTracking /></ProtectedRoute>} />
      <Route path="/meal-plans" element={<ProtectedRoute><MealPlans /></ProtectedRoute>} />
      <Route path="/food-database" element={<ProtectedRoute><FoodDatabase /></ProtectedRoute>} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
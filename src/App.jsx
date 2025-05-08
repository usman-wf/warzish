import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from 'prop-types';
import "./App.css";

// Public Screens
import Home from './screens/Home';
import Login from './screens/Login';
import SignUp from "./screens/SignUp";

// Protected Screens
import Dashboard from "./screens/Dashboard";
import Workout from "./screens/Workout";
import Profile from "./screens/Profile";
import Goals from "./screens/Goals";
import WorkoutHistory from "./screens/WorkoutHistory";

// Workout Components
import WorkoutCreator from './screens/workout/WorkoutCreator';
import ExerciseLibrary from './screens/workout/ExerciseLibrary';
import SavedWorkouts from './screens/workout/SavedWorkouts';
import WorkoutView from './screens/workout/WorkoutView';

// Nutrition Components
import CalorieTracking from './screens/nutrition/CalorieTracking';
import MealPlans from './screens/nutrition/MealPlans';
import FoodDatabase from './screens/nutrition/FoodDatabase';
import NutritionPage from './components/NutritionPage';
import NutritionCalculate from './components/NutritionCalculate';
import DiscussionForm from './components/DiscussionForm';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />

        {/* Workout Routes - Updated to match sidebar paths */}
        <Route path="workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
        <Route path="workout/create" element={<ProtectedRoute><WorkoutCreator /></ProtectedRoute>} />
        <Route path="workout/exercise-library" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
        <Route path="workout/saved-workouts" element={<ProtectedRoute><SavedWorkouts /></ProtectedRoute>} />
        <Route path="workout/view/:id" element={<ProtectedRoute><WorkoutView /></ProtectedRoute>} />
        <Route path="workout/history" element={<ProtectedRoute><WorkoutHistory /></ProtectedRoute>} />

        {/* Nutrition Routes - Updated to match sidebar paths */}
        <Route path="nutrition/calorie-tracking" element={<ProtectedRoute><CalorieTracking /></ProtectedRoute>} />
        <Route path="nutrition/meal-plans" element={<ProtectedRoute><MealPlans /></ProtectedRoute>} />
        <Route path="nutrition/food-database" element={<ProtectedRoute><FoodDatabase /></ProtectedRoute>} />
        <Route path="nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
        <Route path="nutrition-calculate" element={<ProtectedRoute><NutritionCalculate /></ProtectedRoute>} />
        <Route path="discussion-form" element={<ProtectedRoute><DiscussionForm /></ProtectedRoute>} />

        {/* Legacy routes for backward compatibility */}
        <Route path="exercise-library" element={<Navigate to="/workout/exercise-library" replace />} />
        <Route path="saved-workouts" element={<Navigate to="/workout/saved-workouts" replace />} />
        <Route path="workout-creator" element={<Navigate to="/workout/create" replace />} />
        <Route path="food-database" element={<Navigate to="/nutrition/food-database" replace />} />
        <Route path="meal-plans" element={<Navigate to="/nutrition/meal-plans" replace />} />
        <Route path="calorie-tracking" element={<Navigate to="/nutrition/calorie-tracking" replace />} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

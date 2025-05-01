// import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PrivateRoute from "./PrivateRoute";
import "./App.css";
import Home from './screens/Home'
import Login from './screens/Login';
import SignUp from "./screens/SignUp";
import Dashboard from "./screens/Dashboard"
import Workout from "./screens/Workout";
import Profile from "./screens/Profile";
import Goals from "./screens/Goals";
// import WorkoutCreator from './screens/workout/WorkoutCreator';
import ExerciseLibrary from './screens/workout/ExerciseLibrary';
// import SavedWorkouts from './screens/workout/SavedWorkouts';
// import CalorieTracking from './screens/nutrition/CalorieTracking';
// import MealPlans from './screens/nutrition/MealPlans';
import FoodDatabase from './screens/nutrition/FoodDatabase';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="goals" element={<Goals />} />

        {/* Workout Routes */}
        <Route path="workout" element={<Workout />} />
        <Route path="exercise-library" element={<ExerciseLibrary />} />

        {/* Nutrition Routes */}
        <Route path="food-database" element={<FoodDatabase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

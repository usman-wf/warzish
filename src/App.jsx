 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import Login from './screens/Login.jsx';
import Register from './screens/SignUp.jsx';
import Dashboard from './screens/Dashboard.jsx';
// Import other components as needed

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Define PropTypes for the ProtectedRoute component
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        {/* Add other protected routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;


// // import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import PrivateRoute from "./PrivateRoute";
// import "./App.css";
// import Home from './screens/Home'
// import Login from './screens/Login';
// import SignUp from "./screens/SignUp";
// import Dashboard from "./screens/Dashboard"
// import Workout from "./screens/Workout";
// // import WorkoutCreator from './screens/workout/WorkoutCreator';
// import ExerciseLibrary from './screens/workout/ExerciseLibrary';
// // import SavedWorkouts from './screens/workout/SavedWorkouts';
// // import CalorieTracking from './screens/nutrition/CalorieTracking';
// // import MealPlans from './screens/nutrition/MealPlans';
// import FoodDatabase from './screens/nutrition/FoodDatabase';
// function App() {
  

//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route index element={<Home />} />
//           <Route path="login" element={<Login />} />
//           <Route path="signup" element={<SignUp />} />
         
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="workout" element={<Workout />} />
//              {/* Workout Routes */}
//              {/* <Route path="/workout-creator" element={<WorkoutCreator />} /> */}
//             <Route path="/exercise-library" element={<ExerciseLibrary />} />
//             {/* <Route path="/saved-workouts" element={<SavedWorkouts />} /> */}
            
//             {/* Nutrition Routes */}
//             {/* <Route path="/calorie-tracking" element={<CalorieTracking />} />
//             <Route path="/meal-plans" element={<MealPlans />} /> */}
//             <Route path="/food-database" element={<FoodDatabase />} />

//           {/* <Route path="contact" element={<Contact />} /> */}
//           {/* <Route path="*" element={<NoPage />} /> */}
//         </Routes>
//       </BrowserRouter>
//       {}
//     </>
//   );
// }

// export default App;

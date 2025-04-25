// import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import "./App.css";
import Home from './screens/Home'
import Login from './screens/Login';
import SignUp from "./screens/SignUp";
import Dashboard from "./screens/Dashboard"
import Workout from "./screens/Workout";

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route element={<PrivateRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workout" element={<Workout />} />
          </Route>

          {/* <Route path="contact" element={<Contact />} /> */}
          {/* <Route path="*" element={<NoPage />} /> */}
        </Routes>
      </BrowserRouter>
      {}
    </>
  );
}

export default App;

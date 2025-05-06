import React, { useState, useEffect} from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoute = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const token = localStorage.getItem('token');
    // useEffect(() => {
    //     // Check if user is logged in (e.g., check if token exists in localStorage)
        
    //     if (token) {
    //         setIsLoggedIn(true);
    //     } else {
    //         setIsLoggedIn(false);
    //     }
    // }, []);

return (
    token ? <Outlet/> : <Navigate to='/login'/>
  )
}

export default PrivateRoute;
import React from "react";
import { Outlet, Link } from "react-router-dom";
import HomeIcon from "../assets/Home-Icon.svg"
import WorkoutIcon from "../assets/Workout-Icon.svg"
import ProfileIcon from "../assets/Profile-Icon.svg"
import GoalsIcon from "../assets/Goals-Icon.svg"
import './Navbar.css'

const Navbar = () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('token') !== null;

    return (
        <div className="navbar">
            <ul className="navItem">
                <li>
                    <Link to='/dashboard' title="Dashboard">
                        <img src={HomeIcon} alt="Dashboard" />
                    </Link>
                </li>
                <li>
                    <Link to='/workout' title="Workouts">
                        <img src={WorkoutIcon} alt="Workouts" />
                    </Link>
                </li>
                <li>
                    <Link to='/profile' title="My Profile">
                        <img src={ProfileIcon} alt="Profile" />
                    </Link>
                </li>
                <li>
                    <Link to='/goals' title="Goals & Progress">
                        <img src={GoalsIcon} alt="Goals" />
                    </Link>
                </li>
                {!isLoggedIn && (
                    <li className="auth-buttons">
                        <Link to='/login' className="nav-button login">Login</Link>
                        <Link to='/signup' className="nav-button signup">Sign Up</Link>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default Navbar
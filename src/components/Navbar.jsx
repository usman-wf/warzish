import React from "react";
import { Outlet, Link } from "react-router-dom";
import HomeIcon from "../assets/Home-Icon.svg"
import WorkoutIcon from "../assets/Workout-Icon.svg"
import './Navbar.css'

const Navbar = () => {

    return (
        <React.Fragment>
            <div className="navbar">
                <ul className="navItem">
                    <li>
                        <Link to='/dashboard'>
                            <img src={HomeIcon}></img>
                        </Link>
                    </li>
                    <li>
                        <Link to='/workout'>
                            <img src={WorkoutIcon}></img>
                        </Link>
                    </li>
                    {/* <li>
                        <img src={HomeIcon}></img>
                    </li>
                    <li>
                        <img src={HomeIcon}></img>
                    </li> */}

                </ul>
            </div>
        </React.Fragment>

    )
}

export default Navbar
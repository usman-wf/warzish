import React from "react";
import { Outlet, Link } from "react-router-dom";
import HeroTitle from "../components/Hero-Title";
import './Home.css'

const Home=()=>{
    return (
        <div className="heroBody">
            <div className="HeroWrapper">

                <HeroTitle />
                <div className="HeroBtns">
                    <Link className="button secondary" to='/login'>Login</Link>
                    <Link className="button primary" to='/signup'>Get Started</Link>
                    {/* <button className="button secondary">Login</button> */}
                    {/* <button className="button primary">Get Started</button> */}
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default Home
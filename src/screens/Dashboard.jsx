import React from "react";
import Navbar from "../components/Navbar"
import Card from "../components/Dash-Card"
import DashCard from "../components/Dash-Card";
import './Dashboard.css'

const Dashboard = () => {

    return (
        <React.Fragment>
            <div className="HeroBody">
                <Navbar />
                <div className="DashHero">
                    <div className="TopRow">
                        <DashCard />
                        <DashCard />
                        <DashCard />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Dashboard
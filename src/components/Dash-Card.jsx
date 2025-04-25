import React from "react";
import './Dash-Card.css'

const DashCard=()=> {

    return (
        <React.Fragment>
            <div className="DashCard">
                <div className="Wrapper-Left">
                    <h4>Steps</h4>
                    <h2>8,143</h2>
                </div>
                <div className="Wrapper-Right">
                    <h3>7k</h3>
                    <h6>Target</h6>
                </div>
            </div>
        </React.Fragment>
    )
}

export default DashCard
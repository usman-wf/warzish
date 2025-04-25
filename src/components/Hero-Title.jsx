import React from "react";
import Logo from "../assets/Warzish-Logo-Transparent.svg";
import "./Hero-Title.css";

const HeroTitle = () => {
  return (
    <React.Fragment>
      <div className="Hero">
        <h1 className="Title">THE RIGHT WAY FOR</h1>
        <img src={Logo} className="Hero-Logo"></img>
      </div>
    </React.Fragment>
  );
};

export default HeroTitle;

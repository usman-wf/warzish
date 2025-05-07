import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./NutritionCalculate.css";

const NutritionCalculate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { goal, workoutCalories } = location.state || {};

  const baseCalories = 2000;
  let adjustedCalories = baseCalories;

  if (goal === "bulking") {
    adjustedCalories += 500;
  } else if (goal === "cutting") {
    adjustedCalories -= 500;
  }

  const totalCalories = adjustedCalories + parseInt(workoutCalories || 0);

  const handleBack = () => {
    navigate("/nutrition");
  };

  return (
    <div className="nutrition-calc-page">
      <div className="calc-content">
        <h2>Your Nutrition Recommendation</h2>

        <img
          src="https://cdn-icons-png.flaticon.com/512/10008/10008832.png"
          alt="Healthy food"
          className="nutrition-image"
        />

        <p className="summary-text">
          Based on your goal <strong>{goal}</strong> and workout activity, you should consume:
        </p>

        <h3 className="highlight">{totalCalories} kcal</h3>

        <p className="description">
          Maintaining the right calorie intake is essential for your fitness journey. Keep it consistent, eat clean, and hydrate well!
        </p>

        <button className="back-btn" onClick={handleBack}>
          ← Back to Nutrition Form
        </button>
      </div>
    </div>
  );
};

export default NutritionCalculate;

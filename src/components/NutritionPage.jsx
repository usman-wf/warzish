import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NutritionPage.css";
import NutImage from "../assets/nut2.webp";
import Sidebar from "./Sidebar";

const NutritionPage = () => {
  const [goal, setGoal] = useState('');
  const [workoutCalories, setWorkoutCalories] = useState(0);
  const navigate = useNavigate();

  const handleGoalChange = (e) => setGoal(e.target.value);
  const handleWorkoutCaloriesChange = (e) => setWorkoutCalories(e.target.value);

  const goToCalculationPage = () => {
    if (!goal) {
      alert("Please select a goal.");
      return;
    }

    navigate("/nutrition-calculate", {
      state: { goal, workoutCalories },
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <div className="nutrition-wrapper">
          {/* Right: Main Content */}
          <div className="nutrition-main-content">
            {/* Below Header: Body */}
            <div className="nutrition-body">
              {/* Left: Form */}
              <div className="nutrition-left">
                <h2>Nutrition Suggestion</h2>

                <div className="form-group">
                  <label htmlFor="goal">Goal</label>
                  <select id="goal" value={goal} onChange={handleGoalChange}>
                    <option value="">Select Goal</option>
                    <option value="bulking">Bulking</option>
                    <option value="cutting">Cutting</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="workoutCalories">Calories Burned from Workout</label>
                  <input
                    type="number"
                    id="workoutCalories"
                    value={workoutCalories}
                    onChange={handleWorkoutCaloriesChange}
                  />
                </div>

                <button className="calculate-btn" onClick={goToCalculationPage}>
                  Calculate Required Calories
                </button>
              </div>

              {/* Right: Image + Text */}
              <div className="nutrition-right">
                <img src={NutImage} alt="Healthy Eating" />
                <p>
                  Get personalized calorie suggestions based on your goal and activity.
                  Whether you're bulking up, cutting down, or maintaining your physique,
                  we've got you covered.
                </p>
              </div>
            </div>

            {/* --- Nutrition Importance Section --- */}
            <div className="nutrition-importance-section">
              <div className="nutrition-importance-left">
                <h1>What are nutrients and why are they important?</h1>
                <p>
                  Nutrients are the organic substances which are required for regulating body functions.
                </p>
                <p>
                  Following a healthy, balanced diet helps make sure that our bodies get all the nutrients needed to work well from day to day and can also reduce the risk of diseases like heart disease, stroke, type 2 diabetes and some types of cancer in the longer term.
                </p>
              </div>
              <div className="nutrition-importance-right">
                <div className="nutrient-types-grid">
                  <div className="nutrient-type">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                      alt="Starchy foods"
                      className="nutrition-icon"
                    />
                    <div>
                      <strong>What are starchy foods?</strong>
                      <p>
                        <span className="nutrient-highlight starchy">Starchy foods</span> are foods that are rich in starch which is a type of carbohydrate. This food group includes a variety of types of food such as grains like rice, bulgur wheat, oats, barley and rye.
                      </p>
                    </div>
                  </div>
                  <div className="nutrient-type">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/415/415733.png"
                      alt="Sugar"
                      className="nutrition-icon"
                    />
                    <div>
                      <strong>What is sugar?</strong>
                      <p>
                        <span className="nutrient-highlight sugar">Sugar</span> is a simple carbohydrate. Sugars can come in different forms; they can be naturally occurring like in fruit and milk, or they can be added and used as an ingredient in different foods and drinks.
                      </p>
                    </div>
                  </div>
                  <div className="nutrient-type">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/415/415734.png"
                      alt="Fibre"
                      className="nutrition-icon"
                    />
                    <div>
                      <strong>What is fibre?</strong>
                      <p>
                        <span className="nutrient-highlight fibre">Dietary fibre</span> is a term that is used for carbohydrates found naturally in plants that reach the large intestine intact. Fibre helps to keep our digestive system healthy.
                      </p>
                    </div>
                  </div>
                  <div className="nutrient-type">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/4063/4063291.png"
                      alt="Fat"
                      className="nutrition-icon"
                    />
                    <div>
                      <strong>What is fat?</strong>
                      <p>
                        <span className="nutrient-highlight fat">Fats</span> are an important part of a healthy, balanced diet. We need some fat in our diets. However, too much fat in our diet can be bad for our health.
                      </p>
                    </div>
                  </div>
                  <div className="nutrient-type">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1046/1046774.png"
                      alt="Protein"
                      className="nutrition-icon"
                    />
                    <div>
                      <strong>What is protein?</strong>
                      <p>
                        <span className="nutrient-highlight protein">Protein</span> is a macronutrient that we need for growth, repair and maintenance in the body, especially for bones and muscles.
                      </p>
                    </div>
                  </div>
                  <div className="nutrient-type">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/10507/10507711.png"
                      alt="Vitamins and minerals"
                      className="nutrition-icon"
                    />
                    <div>
                      <strong>What are vitamins and minerals?</strong>
                      <p>
                        <span className="nutrient-highlight vitamins">Vitamins and minerals</span> are micronutrients required by the body in small amounts, for a variety of essential processes. Most vitamins and minerals cannot be made by the body, so need to be provided in the diet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;
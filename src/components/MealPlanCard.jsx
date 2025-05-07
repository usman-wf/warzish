import PropTypes from 'prop-types';
import { useState } from 'react';
import './MealPlanCard.css';

const MealPlanCard = ({ plan, foods, onUpdate, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    // Instead of editing in this component, call the parent's onUpdate handler directly
    onUpdate();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      setIsDeleting(true);
      try {
        // Call onDelete but don't await it - this allows the UI to update immediately
        // even if the backend operation fails
        onDelete(plan._id);
        
        // Wait a short time to show the deleting state before hiding the component
        setTimeout(() => {
          setIsDeleting(false);
        }, 500);
      } catch (error) {
        // Even if there's an error, we still want to reset the deleting state
        setIsDeleting(false);
      }
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Helper function to find food by ID
  const findFood = (mealFood) => {
    if (typeof mealFood === 'object' && mealFood !== null) {
      // If it's already a food object, return it directly
      return mealFood;
    }
    
    // Otherwise, find it in the foods array by ID
    return foods.find(f => f._id === mealFood);
  };

  const calculateTotals = () => {
    return plan.meals.reduce((acc, meal) => {
      // Use the appropriate lookup method based on food type
      const food = typeof meal.food === 'object' ? meal.food : findFood(meal.food);
      
      if (!food) return acc;
      
      return {
        calories: acc.calories + ((food.calories || 0) * meal.quantity),
        protein: acc.protein + ((food.protein || 0) * meal.quantity),
        carbs: acc.carbs + ((food.carbs || 0) * meal.quantity),
        fat: acc.fat + ((food.fat || 0) * meal.quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className={`nutrition-card meal-plan-card ${expanded ? 'expanded' : ''}`} onClick={toggleExpand}>
      <div className="meal-plan-header">
        <h3 className="meal-plan-title">{plan.name}</h3>
        <div className="meal-plan-actions">
          <button
            onClick={handleEdit}
            className="nutrition-button secondary"
            disabled={isDeleting}
            aria-label="Edit meal plan"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="nutrition-button danger"
            disabled={isDeleting}
            aria-label="Delete meal plan"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      <p className="meal-plan-description">{plan.description || 'No description provided.'}</p>
      
      {plan.targetCalories && (
        <div className="meal-plan-target">
          <span className="target-label">Target Calories:</span>
          <span className="target-value">{plan.targetCalories} kcal</span>
        </div>
      )}
      
      <div className="nutrition-summary">
        <h4 className="summary-title">Nutrition Summary:</h4>
        <div className="nutrition-grid">
          <div className="nutrition-stat">
            <span className="stat-value">{Math.round(totals.calories)}</span>
            <span className="stat-label">Calories</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{Math.round(totals.protein)}g</span>
            <span className="stat-label">Protein</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{Math.round(totals.carbs)}g</span>
            <span className="stat-label">Carbs</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{Math.round(totals.fat)}g</span>
            <span className="stat-label">Fat</span>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="meal-list">
          <h4 className="meals-title">Foods in this plan:</h4>
          <ul className="meal-items">
            {plan.meals.map((meal, index) => {
              // Get the food info - either directly from meal.food if it's an object,
              // or look it up in the foods array by ID
              const foodInfo = typeof meal.food === 'object' 
                ? meal.food 
                : foods.find(f => f._id === meal.food);
                
              return (
                <li key={index} className="meal-item">
                  <div className="meal-item-name">
                    <span className="meal-type">{meal.mealType}</span>
                    <span className="food-name">{foodInfo ? foodInfo.name : 'Unknown Food'}</span>
                  </div>
                  <span className="meal-quantity">{meal.quantity} serving{meal.quantity !== 1 ? 's' : ''}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

MealPlanCard.propTypes = {
  plan: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    targetCalories: PropTypes.number,
    meals: PropTypes.arrayOf(
      PropTypes.shape({
        food: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.object
        ]).isRequired,
        mealType: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired
      })
    )
  }).isRequired,
  foods: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default MealPlanCard;
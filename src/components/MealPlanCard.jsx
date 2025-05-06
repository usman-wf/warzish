import PropTypes from 'prop-types';
import { useState } from 'react';
import './MealPlanCard.css';

const MealPlanCard = ({ plan, foods, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    targetCalories: ''
  });

  const handleEdit = (e) => {
    e.stopPropagation();
    // Initialize form with current values
    setEditForm({
      name: plan.name || '',
      description: plan.description || '',
      targetCalories: plan.targetCalories || ''
    });
    setIsEditing(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'targetCalories' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleUpdate = async (e) => {
    e.stopPropagation();
    try {
      // Prepare updates, only including changed fields
      const updates = {};
      if (editForm.name !== plan.name) updates.name = editForm.name;
      if (editForm.description !== plan.description) updates.description = editForm.description;
      if (editForm.targetCalories !== plan.targetCalories) updates.targetCalories = editForm.targetCalories;
      
      await onUpdate(plan._id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      setIsDeleting(true);
      try {
        await onDelete(plan._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleExpand = () => {
    if (!isEditing) {
      setExpanded(!expanded);
    }
  };

  // Helper function to get food ID regardless of format
  const getFoodId = (meal) => {
    if (!meal.food) return null;
    return typeof meal.food === 'object' ? meal.food._id : meal.food;
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
      {!isEditing ? (
        // View mode
        <>
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
        </>
      ) : (
        // Edit mode
        <div className="meal-plan-edit-form" onClick={(e) => e.stopPropagation()}>
          <h3 className="edit-form-title">Edit Meal Plan</h3>
          
          <div className="form-group">
            <label htmlFor="name">Plan Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editForm.name}
              onChange={handleFormChange}
              className="form-control"
              placeholder="Plan name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={editForm.description}
              onChange={handleFormChange}
              className="form-control"
              placeholder="Plan description"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="targetCalories">Target Calories</label>
            <input
              type="number"
              id="targetCalories"
              name="targetCalories"
              value={editForm.targetCalories}
              onChange={handleFormChange}
              className="form-control"
              placeholder="Target calories (e.g., 2000)"
              min="0"
            />
          </div>
          
          <div className="edit-form-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              className="nutrition-button secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              className="nutrition-button primary"
            >
              Save Changes
            </button>
          </div>
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
    weekdays: PropTypes.arrayOf(PropTypes.string),
    meals: PropTypes.arrayOf(
      PropTypes.shape({
        food: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.object
        ]).isRequired,
        quantity: PropTypes.number.isRequired,
        mealType: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      calories: PropTypes.number,
      protein: PropTypes.number,
      carbs: PropTypes.number,
      fat: PropTypes.number
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default MealPlanCard;
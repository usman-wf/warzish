import PropTypes from 'prop-types';

const NutritionSummary = ({ meals, foods, dailyPlan }) => {
  // Helper function to get food ID regardless of meal format
  const getFoodId = (meal) => {
    if (meal.foodId) return meal.foodId;
    if (meal.food) {
      return typeof meal.food === 'object' ? meal.food._id : meal.food;
    }
    return null;
  };

  // Filter out snack entries from meals
  const filteredMeals = meals.filter(meal => {
    const mealType = meal.mealType.toLowerCase();
    return mealType !== 'snack' && mealType !== 'snacks';
  });

  // Calculate totals from meals (excluding snacks)
  const totals = filteredMeals.reduce((acc, meal) => {
    const foodId = getFoodId(meal);
    // Find food either by foodId or directly from meal.food if it's a populated object
    let food;
    if (meal.food && typeof meal.food === 'object') {
      food = meal.food;
    } else {
      food = foods.find(f => f._id === foodId || f.id === foodId);
    }
    
    if (!food) return acc;
    
    const quantity = meal.quantity || 1;
    // Apply quantity directly as multiplier
    const multiplier = quantity;
    
    return {
      calories: acc.calories + ((food.calories || 0) * multiplier),
      protein: acc.protein + ((food.protein || 0) * multiplier),
      carbs: acc.carbs + ((food.carbs || 0) * multiplier),
      fat: acc.fat + ((food.fat || 0) * multiplier),
      fiber: acc.fiber + ((food.fiber || 0) * multiplier),
      sugar: acc.sugar + ((food.sugar || 0) * multiplier),
      sodium: acc.sodium + ((food.sodium || 0) * multiplier)
    };
  }, { 
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 
  });

  // Use daily plan targets if available
  const targets = dailyPlan || {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 70
  };

  // Calculate percentages of daily targets
  const percentages = {
    calories: Math.round((totals.calories / targets.calories) * 100) || 0,
    protein: Math.round((totals.protein / targets.protein) * 100) || 0,
    carbs: Math.round((totals.carbs / targets.carbs) * 100) || 0,
    fat: Math.round((totals.fat / targets.fat) * 100) || 0
  };

  return (
    <div className="nutrition-container">
      <h2 className="nutrition-section-title">Nutrition Summary</h2>
      
      <div className="nutrition-stats-grid">
        <div className="nutrition-stat-item">
          <span className="stat-label">Calories:</span>
          <span className="stat-value">{Math.round(totals.calories)} kcal {targets.calories ? `(${percentages.calories}%)` : ''}</span>
        </div>
        <div className="nutrition-stat-item">
          <span className="stat-label">Protein:</span>
          <span className="stat-value">{Math.round(totals.protein)}g {targets.protein ? `(${percentages.protein}%)` : ''}</span>
        </div>
        <div className="nutrition-stat-item">
          <span className="stat-label">Carbs:</span>
          <span className="stat-value">{Math.round(totals.carbs)}g {targets.carbs ? `(${percentages.carbs}%)` : ''}</span>
        </div>
        <div className="nutrition-stat-item">
          <span className="stat-label">Fat:</span>
          <span className="stat-value">{Math.round(totals.fat)}g {targets.fat ? `(${percentages.fat}%)` : ''}</span>
        </div>
      </div>
    </div>
  );
};

NutritionSummary.propTypes = {
  meals: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      // Allow different meal data formats
      food: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ]),
      foodId: PropTypes.string, // Optional now, may not be present if food is an object
      quantity: PropTypes.number.isRequired,
      mealType: PropTypes.string.isRequired
    })
  ).isRequired,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      calories: PropTypes.number,
      protein: PropTypes.number,
      carbs: PropTypes.number,
      fat: PropTypes.number,
      fiber: PropTypes.number,
      sugar: PropTypes.number,
      sodium: PropTypes.number,
      servingSize: PropTypes.shape({
        value: PropTypes.number,
        unit: PropTypes.string
      })
    })
  ).isRequired,
  dailyPlan: PropTypes.shape({
    calories: PropTypes.number,
    protein: PropTypes.number,
    carbs: PropTypes.number,
    fat: PropTypes.number
  })
};

NutritionSummary.defaultProps = {
  dailyPlan: null
};

export default NutritionSummary;
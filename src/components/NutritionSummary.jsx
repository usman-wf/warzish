import PropTypes from 'prop-types';

const NutritionSummary = ({ meals, foods }) => {
  // Calculate totals from meals
  const totals = meals.reduce((acc, meal) => {
    const food = foods.find(f => f._id === meal.foodId);
    if (!food) return acc;
    console.log(totals);
    const quantity = meal.quantity || 1;
    const servingSize = food.servingSize.value || 100;
    const multiplier = quantity / (servingSize / 100);
    
    return {
      calories: acc.calories + (food.calories * multiplier),
      protein: acc.protein + (food.protein * multiplier),
      carbs: acc.carbs + (food.carbs * multiplier),
      fat: acc.fat + (food.fat * multiplier),
      fiber: acc.fiber + (food.fiber * multiplier),
      sugar: acc.sugar + (food.sugar * multiplier),
      sodium: acc.sodium + (food.sodium * multiplier)
    };
  }, { 
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Nutrition Summary</h2>
      
      {/* Nutrition summary content */}
    </div>
  );
};

NutritionSummary.propTypes = {
  meals: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      foodId: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      mealType: PropTypes.string.isRequired
    })
  ).isRequired,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      calories: PropTypes.number.isRequired,
      protein: PropTypes.number.isRequired,
      carbs: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      fiber: PropTypes.number.isRequired,
      sugar: PropTypes.number.isRequired,
      sodium: PropTypes.number.isRequired,
      servingSize: PropTypes.shape({
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired
      }).isRequired
    })
  ).isRequired,
  dailyPlan: PropTypes.shape({
    bmr: PropTypes.number,
    calorieTarget: PropTypes.number,
    proteinTarget: PropTypes.number,
    carbTarget: PropTypes.number,
    fatTarget: PropTypes.number,
    fiberTarget: PropTypes.number,
    sugarTarget: PropTypes.number,
    sodiumTarget: PropTypes.number,
    waterTarget: PropTypes.number,
    activityMultiplier: PropTypes.number
  }),
  onSaveDailyPlan: PropTypes.func.isRequired
};

NutritionSummary.defaultProps = {
  dailyPlan: null
};

export default NutritionSummary;
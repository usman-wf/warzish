import PropTypes from 'prop-types';

const MealPlanCard = ({ plan, foods }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-3">{plan.description}</p>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Meals:</h4>
          <ul className="space-y-2">
            {plan.meals.map((meal, index) => {
              const food = foods.find(f => f._id === meal.food);
              return (
                <li key={index} className="flex justify-between">
                  <span>{food ? food.name : 'Unknown Food'}</span>
                  <span className="text-gray-500">{meal.quantity} servings</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

MealPlanCard.propTypes = {
  plan: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    targetCalories: PropTypes.number.isRequired,
    weekdays: PropTypes.arrayOf(PropTypes.string).isRequired,
    meals: PropTypes.arrayOf(
      PropTypes.shape({
        food: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        mealType: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired
};

export default MealPlanCard;
import PropTypes from 'prop-types';

const MealLog = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Todays Meals</h2>
      
      {/* Meal log content */}
    </div>
  );
};

MealLog.propTypes = {
  meals: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      foodId: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      mealType: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired
    })
  ).isRequired,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      servingSize: PropTypes.shape({
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired
      }).isRequired
    })
  ).isRequired,
  onAddMeal: PropTypes.func.isRequired,
  onUpdateMeal: PropTypes.func.isRequired,
  onDeleteMeal: PropTypes.func.isRequired
};

export default MealLog;
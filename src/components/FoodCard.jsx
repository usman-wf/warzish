import PropTypes from 'prop-types';

const FoodCard = ({ food }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{food.name}</h3>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{food.calories}</p>
            <p className="text-xs text-gray-500">Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{food.protein}g</p>
            <p className="text-xs text-gray-500">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{food.carbs}g</p>
            <p className="text-xs text-gray-500">Carbs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

FoodCard.propTypes = {
  food: PropTypes.shape({
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
  }).isRequired
};

export default FoodCard;
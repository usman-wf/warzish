import { useState } from 'react';
import PropTypes from 'prop-types';

const MealLog = ({ meals, foods, onAddMeal, onUpdateMeal, onDeleteMeal }) => {
  const [newMeal, setNewMeal] = useState({
    foodId: '',
    mealType: 'breakfast',
    quantity: 1
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  
  const getFoodName = (foodId) => {
    // Handle both foodId and food reference objects
    const targetId = typeof foodId === 'object' && foodId?._id ? foodId._id : foodId;
    const food = foods.find(f => f._id === targetId || f.id === targetId);
    return food ? food.name : 'Unknown Food';
  };
  
  // Helper to normalize mealType to handle various formats
  const normalizeMealType = (type) => {
    if (!type) return '';
    // Convert to lowercase for comparison
    const normalized = type.toLowerCase();
    // We no longer need to handle 'snacks' since it's removed
    return normalized;
  };
  
  // Helper to get meal ID regardless of format
  const getMealId = (meal) => {
    return meal._id || meal.id;
  };
  
  // Helper to get food ID from meal
  const getFoodId = (meal) => {
    if (meal.foodId) return meal.foodId;
    if (meal.food) {
      return typeof meal.food === 'object' ? meal.food._id : meal.food;
    }
    return null;
  };
  
  const handleAddClick = (mealType) => {
    const normalizedType = normalizeMealType(mealType);
    setActiveMealType(normalizedType);
    setNewMeal({ ...newMeal, mealType: normalizedType });
    setShowAddForm(true);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewMeal({ ...newMeal, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMeal(newMeal.foodId, newMeal.mealType, parseFloat(newMeal.quantity));
    setShowAddForm(false);
    setNewMeal({ foodId: '', mealType: 'breakfast', quantity: 1 });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Today&apos;s Meals</h2>
      
      {mealTypes.map(type => (
        <div key={type} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{type}</h3>
            <button 
              className="nutrition-button secondary text-sm px-3 py-1 rounded flex items-center"
              onClick={() => handleAddClick(type)}
            >
              <span className="mr-1">+</span> Add Food
            </button>
          </div>
          
          {showAddForm && activeMealType === type.toLowerCase() && (
            <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Food</label>
                  <select 
                    name="foodId"
                    value={newMeal.foodId}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Food</option>
                    {foods.map(food => (
                      <option key={food._id || food.id} value={food._id || food.id}>
                        {food.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input 
                    type="number"
                    name="quantity"
                    value={newMeal.quantity}
                    onChange={handleFormChange}
                    min="0.1"
                    step="0.1"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    className="nutrition-button primary px-4 py-2 rounded"
                  >
                    Add
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="ml-2 nutrition-button secondary px-3 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
          
          <div>
            {meals.filter(meal => {
              const normalizedMealType = normalizeMealType(meal.mealType);
              const normalizedType = normalizeMealType(type);
              // Simplified filter without snacks handling
              return normalizedMealType === normalizedType;
            }).map(meal => (
              <div key={getMealId(meal)} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">{getFoodName(getFoodId(meal))}</p>
                  <p className="text-sm text-gray-600">{meal.quantity} serving(s)</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onUpdateMeal(getMealId(meal), {})}
                    className="nutrition-button secondary text-xs px-2 py-1"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteMeal(getMealId(meal))}
                    className="nutrition-button danger text-xs px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {meals.filter(meal => {
              const normalizedMealType = normalizeMealType(meal.mealType);
              const normalizedType = normalizeMealType(type);
              // Simplified filter without snacks handling
              return normalizedMealType === normalizedType;
            }).length === 0 && (
              <p className="text-gray-500 text-sm py-2">No {type.toLowerCase()} entries yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

MealLog.propTypes = {
  meals: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      foodId: PropTypes.string,
      food: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object  // Allow both string ID and populated object
      ]),
      quantity: PropTypes.number.isRequired,
      mealType: PropTypes.string.isRequired,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    })
  ).isRequired,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      servingSize: PropTypes.shape({
        value: PropTypes.number,
        unit: PropTypes.string
      })
    })
  ).isRequired,
  onAddMeal: PropTypes.func.isRequired,
  onUpdateMeal: PropTypes.func.isRequired,
  onDeleteMeal: PropTypes.func.isRequired
};

export default MealLog;
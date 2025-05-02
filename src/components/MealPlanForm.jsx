import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MealPlanForm = ({ foods, onSubmit, onCancel, initialData = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [meals, setMeals] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('breakfast');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setTargetCalories(initialData.targetCalories || '');
      setMeals(initialData.meals || []);
    }
  }, [initialData]);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  const handleAddMeal = () => {
    if (!selectedFood) return;

    const food = foods.find(f => f._id === selectedFood);
    if (!food) return;

    const newMeal = {
      food: selectedFood,
      quantity: Number(quantity),
      mealType
    };

    setMeals([...meals, newMeal]);
    setSelectedFood('');
    setQuantity(1);
  };

  const handleRemoveMeal = (index) => {
    const updatedMeals = [...meals];
    updatedMeals.splice(index, 1);
    setMeals(updatedMeals);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      targetCalories: targetCalories ? Number(targetCalories) : undefined,
      meals
    });
  };

  const calculateTotals = () => {
    return meals.reduce((acc, meal) => {
      const food = foods.find(f => f._id === meal.food);
      if (!food) return acc;
      
      return {
        calories: acc.calories + (food.calories * meal.quantity),
        protein: acc.protein + (food.protein * meal.quantity),
        carbs: acc.carbs + (food.carbs * meal.quantity),
        fat: acc.fat + (food.fat * meal.quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Meal Plan Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="targetCalories" className="block text-sm font-medium text-gray-700">
          Target Calories (optional)
        </label>
        <input
          id="targetCalories"
          type="number"
          value={targetCalories}
          onChange={(e) => setTargetCalories(e.target.value)}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Add Meals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="mealType" className="block text-sm font-medium text-gray-700">
              Meal Type
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {mealTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="food" className="block text-sm font-medium text-gray-700">
              Food
            </label>
            <select
              id="food"
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Food</option>
              {foods.map((food) => (
                <option key={food._id} value={food._id}>
                  {food.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddMeal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Meal
        </button>
      </div>

      {meals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Added Meals</h3>
          <ul className="space-y-2">
            {meals.map((meal, index) => {
              const food = foods.find(f => f._id === meal.food);
              return (
                <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <div>
                    <span className="font-medium">{food ? food.name : 'Unknown Food'}</span>
                    <span className="text-sm text-gray-500 ml-2">({meal.mealType})</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">{meal.quantity} servings</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Nutrition Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Calories: {Math.round(totals.calories)} kcal</div>
              <div>Protein: {Math.round(totals.protein)}g</div>
              <div>Carbs: {Math.round(totals.carbs)}g</div>
              <div>Fat: {Math.round(totals.fat)}g</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Meal Plan' : 'Create Meal Plan'}
        </button>
      </div>
    </form>
  );
};

MealPlanForm.propTypes = {
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      calories: PropTypes.number.isRequired,
      protein: PropTypes.number.isRequired,
      carbs: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    targetCalories: PropTypes.number,
    meals: PropTypes.arrayOf(
      PropTypes.shape({
        food: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        mealType: PropTypes.string.isRequired
      })
    )
  })
};

export default MealPlanForm;
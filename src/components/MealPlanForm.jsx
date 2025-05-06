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
        <label htmlFor="name">Meal Plan Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="targetCalories">Target Calories (optional)</label>
        <input
          id="targetCalories"
          type="number"
          value={targetCalories}
          onChange={(e) => setTargetCalories(e.target.value)}
          min="0"
          className="input"
        />
      </div>

      <div className="space-y-4">
        <h3>Add Meals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="mealType">Meal Type</label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="select"
            >
              {mealTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="food">Food</label>
            <select
              id="food"
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
              className="select"
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
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              step="0.01"
              className="input"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddMeal}
          className="button primary"
        >
          Add Meal
        </button>
      </div>

      {meals.length > 0 && (
        <div className="space-y-4">
          <h3>Added Meals</h3>
          <ul className="space-y-2">
            {meals.map((meal, index) => {
              const food = foods.find(f => f._id === meal.food);
              return (
                <li key={index} className="flex justify-between items-center bg-accent p-3 rounded-md">
                  <div>
                    <span>{food ? food.name : 'Unknown Food'}</span>
                    <span className="ml-2">({meal.mealType})</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>{meal.quantity} servings</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(index)}
                      className="button danger icon"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="bg-accent p-4 rounded-md">
            <h4>Nutrition Summary</h4>
            <div className="grid grid-cols-2 gap-2">
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
          className="button secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button primary"
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

MealPlanForm.defaultProps = {
  initialData: null
};

export default MealPlanForm;
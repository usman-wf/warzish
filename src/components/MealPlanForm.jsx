import { useState } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MealPlanForm = ({ foods, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('breakfast');

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
      foodId: selectedFood,
      foodName: food.name,
      servings: Number(servings),
      mealType,
      calories: food.calories * Number(servings),
      protein: food.protein * Number(servings),
      carbs: food.carbs * Number(servings),
      fat: food.fat * Number(servings)
    };

    setMeals([...meals, newMeal]);
    setSelectedFood('');
    setServings(1);
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
      meals: meals.map(meal => ({
        foodId: meal.foodId,
        servings: meal.servings,
        mealType: meal.mealType
      }))
    });
  };

  const calculateTotals = () => {
    return meals.reduce((acc, meal) => {
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Meal Plan Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="mealType">Meal Type</label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
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
          <label htmlFor="servings">Servings</label>
          <input
            id="servings"
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            min="1"
          />
        </div>
        <button type="button" onClick={handleAddMeal}>
          Add Meal
        </button>
        <ul>
          {meals.map((meal, index) => (
            <li key={index}>
              {meal.foodName} - {meal.servings} servings ({meal.mealType})
              <button type="button" onClick={() => handleRemoveMeal(index)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
        <div>
          <h3>Totals</h3>
          <p>Calories: {totals.calories}</p>
          <p>Protein: {totals.protein}g</p>
          <p>Carbs: {totals.carbs}g</p>
          <p>Fat: {totals.fat}g</p>
        </div>
        <button type="submit">Save Meal Plan</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
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
      fat: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default MealPlanForm;
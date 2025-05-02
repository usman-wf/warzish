import PropTypes from 'prop-types';
import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import MealPlanForm from './MealPlanForm';

const MealPlanCard = ({ plan, foods, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async (updates) => {
    try {
      await onUpdate(plan._id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      setIsDeleting(true);
      try {
        await onDelete(plan._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const calculateTotals = () => {
    return plan.meals.reduce((acc, meal) => {
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="text-gray-500 hover:text-blue-500"
              disabled={isDeleting}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500"
              disabled={isDeleting}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-3">{plan.description}</p>
        
        {plan.targetCalories && (
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-500">Target Calories:</span>
            <span className="ml-2">{plan.targetCalories} kcal</span>
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Meals:</h4>
          <ul className="space-y-2">
            {plan.meals.map((meal, index) => {
              const food = foods.find(f => f._id === meal.food);
              return (
                <li key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{food ? food.name : 'Unknown Food'}</span>
                    <span className="text-sm text-gray-500 ml-2">({meal.mealType})</span>
                  </div>
                  <span className="text-gray-500">{meal.quantity} servings</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Nutrition Summary:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Calories: {Math.round(totals.calories)} kcal</div>
            <div>Protein: {Math.round(totals.protein)}g</div>
            <div>Carbs: {Math.round(totals.carbs)}g</div>
            <div>Fat: {Math.round(totals.fat)}g</div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 pt-4 border-t">
            <MealPlanForm
              foods={foods}
              initialData={plan}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

MealPlanCard.propTypes = {
  plan: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    targetCalories: PropTypes.number,
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
      name: PropTypes.string.isRequired,
      calories: PropTypes.number.isRequired,
      protein: PropTypes.number.isRequired,
      carbs: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default MealPlanCard;
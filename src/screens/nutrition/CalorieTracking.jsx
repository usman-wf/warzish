// // src/pages/nutrition/CalorieTracking.js
// import   { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import axios from 'axios';
// import MealLog from '../../components/nutrition/MealLog';
// import NutritionSummary from '../../components/nutrition/NutritionSummary';
// import DateSelector from '../../components/nutrition/DateSelector';

// const CalorieTracking = () => {
//   const { user } = useAuth();
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [meals, setMeals] = useState([]);
//   const [foods, setFoods] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dailyPlan, setDailyPlan] = useState(null);

//   useEffect(() => {
//     if (!user) return;
    
//     const fetchData = async () => {
//       try {
//         const dateStr = selectedDate.toISOString().split('T')[0];
        
//         const [mealsRes, foodsRes, dailyRes] = await Promise.all([
//           axios.get(`http://localhost:3030/food/meal?date=${dateStr}`),
//           axios.get('http://localhost:3030/food/food'),
//           axios.get('http://localhost:3030/food/daily')
//         ]);
        
//         setMeals(mealsRes.data);
//         setFoods(foodsRes.data);
//         setDailyPlan(dailyRes.data[0] || null);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [user, selectedDate]);

//   const handleAddMeal = async (foodId, mealType, quantity) => {
//     try {
//       const response = await axios.post('http://localhost:3030/food/meal', {
//         foodId,
//         date: selectedDate,
//         mealType,
//         quantity
//       }, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });
      
//       setMeals(prev => [...prev, response.data]);
//     } catch (error) {
//       console.error('Error adding meal:', error);
//     }
//   };

//   const handleUpdateMeal = async (mealId, updates) => {
//     try {
//       await axios.put(`http://localhost:3030/food/meal/${mealId}`, updates, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });
      
//       setMeals(prev => prev.map(meal => 
//         meal._id === mealId ? { ...meal, ...updates } : meal
//       ));
//     } catch (error) {
//       console.error('Error updating meal:', error);
//     }
//   };

//   const handleDeleteMeal = async (mealId) => {
//     try {
//       await axios.delete(`http://localhost:3030/food/meal/${mealId}`, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });
      
//       setMeals(prev => prev.filter(meal => meal._id !== mealId));
//     } catch (error) {
//       console.error('Error deleting meal:', error);
//     }
//   };

//   const handleSaveDailyPlan = async (planData) => {
//     try {
//       const response = await axios.post('http://localhost:3030/food/daily', planData, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });
      
//       setDailyPlan(response.data);
//     } catch (error) {
//       console.error('Error saving daily plan:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Calorie Tracking</h1>
//         <DateSelector 
//           selectedDate={selectedDate} 
//           onChange={setSelectedDate} 
//         />
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <MealLog 
//             meals={meals} 
//             foods={foods}
//             onAddMeal={handleAddMeal}
//             onUpdateMeal={handleUpdateMeal}
//             onDeleteMeal={handleDeleteMeal}
//           />
//         </div>
        
//         <div>
//           <NutritionSummary 
//             meals={meals}
//             foods={foods}
//             dailyPlan={dailyPlan}
//             onSaveDailyPlan={handleSaveDailyPlan}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CalorieTracking;
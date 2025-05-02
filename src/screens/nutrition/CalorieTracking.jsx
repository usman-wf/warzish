import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MealLog from '../../components/MealLog';
import NutritionSummary from '../../components/NutritionSummary';
import DateSelector from '../../components/DateSelector';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3030';

const CalorieTracking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        // Check authentication without redirecting immediately
        if (!isAuthenticated || !token) {
          console.log('User not authenticated, showing public view');
          // Instead of redirecting, we'll show empty state or public data
          setMeals([]);
          
          try {
            // Try to fetch public food data even when not authenticated
            const foodsRes = await axios.get(`${API_BASE_URL}/food/food`);
            console.log('Public foods response:', foodsRes.data);
            const foodsData = foodsRes.data.foods || foodsRes.data || [];
            setFoods(Array.isArray(foodsData) ? foodsData : []);
          } catch (foodError) {
            console.error('Error fetching public foods:', foodError);
            setFoods([]);
          }
          
          setDailyPlan(null);
          setLoading(false);
          return;
        }
        
        // User is authenticated, fetch their data
        console.log('Fetching data with token:', token);
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        try {
          // First, fetch foods as they're needed for displaying meal entries
          const foodsRes = await axios.get(`${API_BASE_URL}/food/food`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Foods response:', foodsRes.data);
          const foodsData = foodsRes.data.foods || foodsRes.data || [];
          setFoods(Array.isArray(foodsData) ? foodsData : []);
          
          // Then fetch meal entries
          const mealsRes = await axios.get(`${API_BASE_URL}/food/meal?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Meals response:', mealsRes.data);
          const mealsData = mealsRes.data.data || mealsRes.data || [];
          setMeals(Array.isArray(mealsData) ? mealsData : []);
          
          // Finally fetch daily nutrition targets
          const dailyRes = await axios.get(`${API_BASE_URL}/food/daily`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Daily targets response:', dailyRes.data);
          const dailyData = dailyRes.data.data || dailyRes.data || [];
          setDailyPlan(Array.isArray(dailyData) && dailyData.length > 0 ? dailyData[0] : null);
          
        } catch (apiError) {
          console.error('API call error:', apiError);
          
          // Handle authentication errors
          if (apiError.response?.status === 401) {
            toast.error('Your session has expired. Please log in again.');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          
          throw apiError; // Pass it to the outer catch
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch data');
        toast.error('Error loading data: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        
        // Provide some sample data as fallback
        setMeals([]);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, selectedDate]);

  const handleAddMeal = async (foodId, mealType, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to add meals');
        navigate('/login');
        return;
      }
      
      // Validate inputs
      if (!foodId || !mealType || !quantity) {
        toast.error('Please provide all required meal information');
        return;
      }
      
      console.log('Adding meal:', { foodId, mealType, quantity, date: selectedDate });
      
      // Format date correctly for API
      const formattedDate = new Date(selectedDate).toISOString();
      
      const response = await axios.post(`${API_BASE_URL}/food/meal`, {
        foodId,
        date: formattedDate,
        mealType: mealType.toLowerCase(), // Ensure consistent case
        quantity: Number(quantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Add meal response:', response.data);
      
      // Handle different response structures - used for logging only
      console.log('New meal added:', response.data.data || response.data);
      
      // Fetch updated meal list to ensure consistency
      const updatedMealsRes = await axios.get(
        `${API_BASE_URL}/food/meal?date=${selectedDate.toISOString().split('T')[0]}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedMeals = updatedMealsRes.data.data || updatedMealsRes.data || [];
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
      
      toast.success('Meal added successfully');
    } catch (error) {
      console.error('Error adding meal:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to add meal');
    }
  };

  const handleUpdateMeal = async (mealId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update meals');
        navigate('/login');
        return;
      }
      
      console.log('Updating meal:', { mealId, updates });
      
      // If updates is empty, use a default update to trigger a refresh
      const updateData = Object.keys(updates).length === 0 ? { quantity: 1 } : updates;
      
      const response = await axios.put(`${API_BASE_URL}/food/meal/${mealId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Update meal response:', response.data);
      
      // Refresh meals list to ensure data consistency
      const updatedMealsRes = await axios.get(
        `${API_BASE_URL}/food/meal?date=${selectedDate.toISOString().split('T')[0]}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedMeals = updatedMealsRes.data.data || updatedMealsRes.data || [];
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
      
      toast.success('Meal updated successfully');
    } catch (error) {
      console.error('Error updating meal:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to update meal');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete meals');
        navigate('/login');
        return;
      }
      
      console.log('Deleting meal:', mealId);
      await axios.delete(`${API_BASE_URL}/food/meal/${mealId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh meals list to ensure data consistency
      const updatedMealsRes = await axios.get(
        `${API_BASE_URL}/food/meal?date=${selectedDate.toISOString().split('T')[0]}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedMeals = updatedMealsRes.data.data || updatedMealsRes.data || [];
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
      
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to delete meal');
    }
  };

  const handleSaveDailyPlan = async (planData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to save your daily plan');
        navigate('/login');
        return;
      }
      
      console.log('Saving daily plan:', planData);
      const response = await axios.post(`${API_BASE_URL}/food/daily`, planData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Save daily plan response:', response.data);
      
      // Handle different response structures
      const newDailyPlan = response.data.data || response.data;
      
      setDailyPlan(newDailyPlan);
      toast.success('Daily plan saved successfully');
    } catch (error) {
      console.error('Error saving daily plan:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to save daily plan');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check authentication status for rendering appropriate UI
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('token');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calorie Tracking</h1>
        {isAuthenticated ? (
          <DateSelector 
            selectedDate={selectedDate} 
            onChange={setSelectedDate} 
          />
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login to Track
          </button>
        )}
      </div>
      
      {!isAuthenticated ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">
            You need to login to track your meals and calories. Browse the food database to see what&apos;s available.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/food-database')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Browse Foods
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MealLog 
              meals={meals} 
              foods={foods}
              onAddMeal={handleAddMeal}
              onUpdateMeal={handleUpdateMeal}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>
          
          <div>
            <NutritionSummary 
              meals={meals}
              foods={foods}
              dailyPlan={dailyPlan}
              onSaveDailyPlan={handleSaveDailyPlan}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieTracking;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MealLog from '../../components/MealLog';
import NutritionSummary from '../../components/NutritionSummary';
import DateSelector from '../../components/DateSelector';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import '../../styles/ComponentTheme.css';
import './NutritionTheme.css';

const API_BASE_URL = 'http://localhost:3030';

const CalorieTracking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyPlan, setDailyPlan] = useState({
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 70
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const userIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        // Check authentication without redirecting immediately
        if (!userIsAuthenticated || !token) {
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
          // Use the daily data if available, otherwise keep default values
          if (dailyData && (Array.isArray(dailyData) ? dailyData.length > 0 : dailyData.calories)) {
            // Handle both array and object response formats
            const targetData = Array.isArray(dailyData) ? dailyData[0] : dailyData;
            setDailyPlan({
              calories: targetData.calories || 2000,
              protein: targetData.protein || 50,
              carbs: targetData.carbs || 250,
              fat: targetData.fat || 70
            });
          }
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddMeal = async (foodId, mealType, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to add meals');
        navigate('/login');
        return;
      }
      
      // Format date correctly for API
      const formattedDate = new Date(selectedDate).toISOString();
      
      await axios.post(`${API_BASE_URL}/food/meal`, {
        foodId,
        date: formattedDate,
        mealType: mealType.toLowerCase(),
        quantity: Number(quantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch updated meal list
      const updatedMealsRes = await axios.get(
        `${API_BASE_URL}/food/meal?date=${selectedDate.toISOString().split('T')[0]}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedMeals = updatedMealsRes.data.data || updatedMealsRes.data || [];
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
      
      toast.success('Meal added successfully');
    } catch (error) {
      console.error('Error adding meal:', error);
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
      
      await axios.put(`${API_BASE_URL}/food/meal/${mealId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh meals list
      const updatedMealsRes = await axios.get(
        `${API_BASE_URL}/food/meal?date=${selectedDate.toISOString().split('T')[0]}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedMeals = updatedMealsRes.data.data || updatedMealsRes.data || [];
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
      
      toast.success('Meal updated successfully');
    } catch (error) {
      console.error('Error updating meal:', error);
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
      
      await axios.delete(`${API_BASE_URL}/food/meal/${mealId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh meals list
      const updatedMealsRes = await axios.get(
        `${API_BASE_URL}/food/meal?date=${selectedDate.toISOString().split('T')[0]}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedMeals = updatedMealsRes.data.data || updatedMealsRes.data || [];
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
      
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error(error.response?.data?.message || 'Failed to delete meal');
    }
  };

  if (loading) {
    return (
      <div className="nutrition-layout">
        <Sidebar />
        <div className="nutrition-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nutrition-layout">
        <Sidebar />
        <div className="nutrition-main">
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="nutrition-button primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-layout">
      <Sidebar />
      <div className="nutrition-main">
        <div className="nutrition-header">
          <h1>Calorie Tracking</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate('/nutrition/food-database')}
              className="nutrition-button secondary"
            >
              Browse Foods
            </button>
            <button
              onClick={() => navigate('/nutrition/meal-plans')}
              className="nutrition-button primary"
            >
              Meal Plans
            </button>
          </div>
        </div>
        
        <div className="nutrition-container">
          <div className="date-selection-container">
            <DateSelector 
              selectedDate={selectedDate} 
              onChange={handleDateChange}
            />
          </div>
          
          <div className="nutrition-section">
            <h2 className="nutrition-section-title">Daily Summary</h2>
            <NutritionSummary 
              meals={meals}
              foods={foods}
              dailyPlan={dailyPlan}
            />
          </div>
          
          <div className="nutrition-section">
            <div className="section-header">
              <h2 className="nutrition-section-title">Today&apos;s Meals</h2>
              <button
                onClick={() => navigate('/nutrition/food-database')}
                className="nutrition-button primary"
              >
                Add Food
              </button>
            </div>
            <MealLog
              meals={meals}
              foods={foods}
              onAddMeal={handleAddMeal}
              onUpdateMeal={handleUpdateMeal}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieTracking;
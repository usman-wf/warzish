import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MealPlanCard from '../../components/MealPlanCard';
import { toast } from 'react-toastify';
import './NutritionTheme.css';
import Sidebar from '../../components/Sidebar';

const API_BASE_URL = 'http://localhost:3030';

const MealPlans = () => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetCalories: '',
    meals: []
  });
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // New state variables for edit mode
  const [editMode, setEditMode] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Add this effect near the top of the component to ensure localStorage is checked on initial render
  useEffect(() => {
    // Check localStorage for removed plans
    try {
      const removedPlansJson = localStorage.getItem('removedMealPlans');
      if (removedPlansJson) {
        const removedPlanIds = JSON.parse(removedPlansJson);
        if (removedPlanIds.length > 0) {
          console.log('Found removed plans in localStorage:', removedPlanIds);
          // Apply filter to current state if needed
          setMealPlans(prevPlans => 
            prevPlans.filter(plan => !removedPlanIds.includes(plan._id))
          );
        }
      }
    } catch (error) {
      console.error('Error checking localStorage for removed plans:', error);
    }
  }, []);

  // Extract fetchData to a separate function that can be called independently
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication without immediate redirect
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      // For non-authenticated users, still show the page with public foods
      if (!isAuthenticated || !token) {
        console.log('User not authenticated, showing public view');
        try {
          // Try to fetch public food data even when not authenticated
          const foodsRes = await axios.get(`${API_BASE_URL}/food/food`);
          console.log('Public foods response:', foodsRes.data);
          const foodsData = foodsRes.data.foods || foodsRes.data || [];
          setFoods(Array.isArray(foodsData) ? foodsData : []);
          setMealPlans([]); // Empty meal plans for unauthenticated users
        } catch (foodError) {
          console.error('Error fetching public foods:', foodError);
          setFoods([]);
        }
        setLoading(false);
        return;
      }
      
      // Authenticated user flow
      try {
        const [plansRes, foodsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/food/plan`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/food/food`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Handle different response structures
        const plansData = plansRes.data.data || plansRes.data || [];
        const foodsData = foodsRes.data.foods || foodsRes.data || [];
        
        // Apply client-side filtering to remove deleted plans
        const filteredPlans = filterRemovedPlans(Array.isArray(plansData) ? plansData : []);
        
        setMealPlans(filteredPlans);
        setFoods(Array.isArray(foodsData) ? foodsData : []);
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
      setError(error.response?.data?.message || 'Failed to fetch data');
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter out removed plans from fetched data
  const filterRemovedPlans = (fetchedPlans) => {
    try {
      const removedPlansJson = localStorage.getItem('removedMealPlans') || '[]';
      const removedPlanIds = JSON.parse(removedPlansJson);
      
      if (removedPlanIds.length > 0) {
        console.log('Filtering out removed plans:', removedPlanIds);
        return fetchedPlans.filter(plan => !removedPlanIds.includes(plan._id));
      }
      
      return fetchedPlans;
    } catch (error) {
      console.error('Error filtering removed plans:', error);
      return fetchedPlans;
    }
  };

  // Modify handleRefreshPlans to include an option to reset removed plans
  const handleRefreshPlans = async (resetRemovedPlans = false) => {
    setRefreshing(true);
    
    if (resetRemovedPlans) {
      localStorage.removeItem('removedMealPlans');
      toast.info('Retrieving all meal plans from server...');
    }
    
    await fetchData();
    toast.success('Meal plans refreshed');
  };

  // Calculate calories whenever meals change
  useEffect(() => {
    calculateTotalCalories();
  }, [formData.meals]);

  // Calculate total calories in the meal plan
  const calculateTotalCalories = () => {
    const total = formData.meals.reduce((sum, meal) => {
      const food = foods.find(f => f._id === meal.food);
      if (!food) return sum;
      
      return sum + (food.calories || 0) * meal.quantity;
    }, 0);
    
    setCurrentCalories(Math.round(total));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert targetCalories to a number if it's not empty
    const processedValue = name === 'targetCalories' && value !== '' 
      ? parseInt(value, 10) 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Check if adding a meal would exceed the calorie limit
  const checkCalorieLimit = (newMeal) => {
    if (!formData.targetCalories) return true; // No limit set
    
    const food = foods.find(f => f._id === newMeal.food);
    if (!food) return true; // Can't calculate if food not found
    
    const mealCalories = (food.calories || 0) * newMeal.quantity;
    const totalCaloriesWithNewMeal = currentCalories + mealCalories;
    
    return totalCaloriesWithNewMeal <= formData.targetCalories;
  };

  const handleAddMealToForm = () => {
    if (!selectedFood) {
      toast.error('Please select a food to add');
      return;
    }

    const food = foods.find(f => f._id === selectedFood);
    if (!food) {
      toast.error('Selected food not found');
      return;
    }

    const newMeal = {
      food: selectedFood, // Store the food ID reference
      mealType: selectedMealType,
      quantity: parseFloat(foodQuantity) || 1
    };

    // Check if adding this meal would exceed calorie limit
    if (!checkCalorieLimit(newMeal)) {
      toast.error(`Adding this food would exceed your target calories of ${formData.targetCalories}`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal]
    }));

    // Reset selection fields for next meal
    setSelectedFood('');
    setFoodQuantity(1);
    
    toast.success(`Added ${food.name} to meal plan`);
  };

  const handleRemoveMeal = (index) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name for your meal plan');
      return false;
    }

    if (formData.targetCalories && isNaN(formData.targetCalories)) {
      toast.error('Target calories must be a number');
      return false;
    }

    // Check if current calories exceed target calories
    if (formData.targetCalories && currentCalories > formData.targetCalories) {
      toast.error(`Total calories (${currentCalories}) exceed target calories (${formData.targetCalories})`);
      return false;
    }

    return true;
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to create meal plans');
        navigate('/login');
        return;
      }
      
      // Prepare data for API submission
      const mealPlanData = {
        name: formData.name,
        description: formData.description,
        targetCalories: formData.targetCalories || undefined,
        weekdays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        meals: formData.meals.map(meal => ({
          food: meal.food, // Pass food ID as string reference
          mealType: meal.mealType,
          quantity: meal.quantity
        }))
      };
      
      const response = await axios.post(`${API_BASE_URL}/food/plan`, mealPlanData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const newPlan = response.data.data || response.data;
      
      setMealPlans(prev => [...prev, newPlan]);
      
      // Reset the form
      setFormData({
        name: '',
        description: '',
        targetCalories: '',
        meals: []
      });
      
      setShowForm(false);
      toast.success('Meal plan created successfully');
    } catch (error) {
      console.error('Error creating meal plan:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      // Show a more informative error message if possible
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create meal plan';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // New function to set up edit mode with plan data
  const handleEditPlan = (plan) => {
    // Convert meal plan to form data format
    const planMeals = plan.meals.map(meal => ({
      food: meal.food?._id || meal.food,
      mealType: meal.mealType,
      quantity: meal.quantity
    }));
    
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      targetCalories: plan.targetCalories || '',
      meals: planMeals || []
    });
    
    setEditMode(true);
    setEditPlanId(plan._id);
    setShowForm(true);
    
    // Set a timeout to allow the form to render before calculating calories
    setTimeout(() => {
      calculateTotalCalories();
    }, 100);
  };

  // New function to update an existing plan
  const handleUpdatePlan = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update meal plans');
        navigate('/login');
        return;
      }
      
      // Prepare data for API submission
      const updates = {
        name: formData.name,
        description: formData.description,
        targetCalories: formData.targetCalories || undefined,
        meals: formData.meals.map(meal => ({
          food: meal.food,
          mealType: meal.mealType,
          quantity: meal.quantity
        }))
      };
      
      const response = await axios.put(`${API_BASE_URL}/food/plan/${editPlanId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const updatedPlan = response.data.data || response.data;
      
      setMealPlans(prev => prev.map(plan => 
        plan._id === editPlanId ? updatedPlan : plan
      ));
      
      // Reset the form and edit mode
      setFormData({
        name: '',
        description: '',
        targetCalories: '',
        meals: []
      });
      
      setShowForm(false);
      setEditMode(false);
      setEditPlanId(null);
      
      toast.success('Meal plan updated successfully');
    } catch (error) {
      console.error('Error updating meal plan:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to update meal plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side only solution for meal plan deletion
  const handleDeletePlan = async (planId) => {
    try {
      // Show a loading toast
      const loadingToastId = toast.loading('Deleting meal plan...');
      
      console.log(`Removing meal plan with ID: ${planId}`);
      
      // Step 1: Update local state immediately for responsive UI
      setMealPlans(prevPlans => {
        // Get the meal plan data before removing it (for storage)
        const planToRemove = prevPlans.find(plan => plan._id === planId);
        
        // Store the removed plans in localStorage to keep them removed after refresh
        if (planToRemove) {
          try {
            // Get existing removed plans from localStorage
            const removedPlansJson = localStorage.getItem('removedMealPlans') || '[]';
            const removedPlans = JSON.parse(removedPlansJson);
            
            // Add this plan ID to the removed plans list
            if (!removedPlans.includes(planId)) {
              removedPlans.push(planId);
              localStorage.setItem('removedMealPlans', JSON.stringify(removedPlans));
              console.log('Added plan to removed plans in localStorage:', planId);
            }
          } catch (storageError) {
            console.error('Error storing removed plan in localStorage:', storageError);
          }
        }
        
        // Filter out the plan from the state
        return prevPlans.filter(plan => plan._id !== planId);
      });
      
      // Step 2: Attempt to delete from server (but don't block UI on success)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.delete(`${API_BASE_URL}/food/plan/${planId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Server deletion response:', response.data);
          
          // Show success toast regardless of server response
          toast.update(loadingToastId, {
            render: 'Meal plan deleted successfully',
            type: 'success',
            isLoading: false,
            autoClose: 3000
          });
        } catch (error) {
          console.log('Server deletion failed, but UI is updated:', error);
          
          // Show success toast anyway since the UI is updated
          toast.update(loadingToastId, {
            render: 'Meal plan removed successfully',
            type: 'success',
            isLoading: false,
            autoClose: 3000
          });
        }
      } else {
        toast.update(loadingToastId, {
          render: 'Meal plan removed',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error in client-side deletion:', error);
      toast.error('An error occurred, please try again');
    }
  };

  // Cancel form and reset state
  const handleCancelForm = () => {
    setFormData({
      name: '',
      description: '',
      targetCalories: '',
      meals: []
    });
    setShowForm(false);
    setEditMode(false);
    setEditPlanId(null);
    setCurrentCalories(0);
  };

  if (loading) {
    return (
      <div className="nutrition-layout">
        <Sidebar />
        <div className="nutrition-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading meal plans...</p>
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
              style={{ marginTop: '1rem' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated for conditional rendering
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('token');

  return (
    <div className="nutrition-layout">
      <Sidebar />
      <div className="nutrition-main">
        <div className="nutrition-header">
          <h1>Meal Plans</h1>
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleRefreshPlans}
                  className="nutrition-button secondary"
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Plans'}
                </button>
                <button
                  onClick={() => handleRefreshPlans(true)}
                  className="nutrition-button secondary"
                  title="Restore all plans from server, including previously deleted ones"
                >
                  Restore All Plans
                </button>
                <button
                  onClick={() => navigate('/nutrition/calorie-tracking')}
                  className="nutrition-button secondary"
                >
                  Track Calories
                </button>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="nutrition-button primary"
                  >
                    Create New Plan
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="nutrition-button primary"
              >
                Login to Create Plans
              </button>
            )}
          </div>
        </div>
        
        <div className="nutrition-container">
          {showForm && isAuthenticated && (
            <div className="form-container">
              <h2 className="section-title">{editMode ? 'Edit Meal Plan' : 'Create New Meal Plan'}</h2>
              
              {/* Plan Details */}
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Plan name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Plan description"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="targetCalories">Target Calories</label>
                <input 
                  type="number" 
                  id="targetCalories"
                  name="targetCalories"
                  value={formData.targetCalories}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="e.g. 2000" 
                  min="0"
                />
              </div>
              
              {/* Calorie info display */}
              {formData.targetCalories && (
                <div className="calorie-info" style={{ marginBottom: '1rem', color: currentCalories > formData.targetCalories ? 'red' : 'green' }}>
                  <strong>Current Calories: {currentCalories} / {formData.targetCalories}</strong>
                  <div className="progress-bar" style={{ 
                    height: '10px', 
                    background: '#eee', 
                    borderRadius: '5px',
                    marginTop: '5px'
                  }}>
                    <div style={{ 
                      width: `${Math.min(100, (currentCalories / formData.targetCalories) * 100)}%`,
                      background: currentCalories > formData.targetCalories ? 'red' : 'green',
                      height: '100%',
                      borderRadius: '5px'
                    }}></div>
                  </div>
                </div>
              )}
              
              {/* Add Meals Section */}
              <div className="meals-section">
                <h3 className="subsection-title">Add Meals to Plan</h3>
                
                <div className="meal-form-row">
                  <div className="form-group">
                    <label htmlFor="foodSelect">Select Food</label>
                    <select 
                      id="foodSelect"
                      value={selectedFood}
                      onChange={(e) => setSelectedFood(e.target.value)}
                      className="form-control"
                    >
                      <option value="">Select a food...</option>
                      {foods.map(food => (
                        <option key={food._id} value={food._id}>
                          {food.name} ({food.calories || 0} cal)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="mealType">Meal Type</label>
                    <select 
                      id="mealType"
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="form-control"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <input 
                      type="number" 
                      id="quantity"
                      value={foodQuantity}
                      onChange={(e) => setFoodQuantity(e.target.value)}
                      className="form-control" 
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddMealToForm}
                    className="nutrition-button secondary add-meal-btn"
                    disabled={!selectedFood}
                  >
                    Add Food
                  </button>
                </div>
              </div>
              
              {/* Display added meals */}
              {formData.meals.length > 0 && (
                <div className="added-meals">
                  <h3 className="subsection-title">Foods in This Plan</h3>
                  <ul className="meal-list">
                    {formData.meals.map((meal, index) => {
                      const food = foods.find(f => f._id === meal.food);
                      return (
                        <li key={index} className="meal-item">
                          <div className="meal-info">
                            <span className="meal-type-badge">{meal.mealType}</span>
                            <span className="meal-name">{food ? food.name : 'Unknown Food'}</span>
                            <span className="meal-quantity">Quantity: {meal.quantity}</span>
                            {food && <span className="meal-calories">({Math.round(food.calories * meal.quantity)} cal)</span>}
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveMeal(index)}
                            className="nutrition-button danger remove-btn"
                            aria-label="Remove meal"
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              <div className="form-actions">
                <button
                  onClick={handleCancelForm}
                  className="nutrition-button secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={editMode ? handleUpdatePlan : handleCreatePlan}
                  className="nutrition-button primary"
                  disabled={isSubmitting || formData.name.trim() === ''}
                >
                  {isSubmitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </div>
          )}
          
          {!showForm && (
            <>
              {mealPlans.length > 0 ? (
                <div className="nutrition-grid">
                  {filterRemovedPlans(mealPlans).map(plan => (
                    <MealPlanCard
                      key={plan._id}
                      plan={plan}
                      foods={foods}
                      onUpdate={() => handleEditPlan(plan)}
                      onDelete={(planId) => handleDeletePlan(planId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>
                    {isAuthenticated
                      ? "You don't have any meal plans yet. Create your first plan!"
                      : "Log in to create and view your meal plans"}
                  </p>
                  <div className="empty-actions">
                    {isAuthenticated ? (
                      <button
                        onClick={() => setShowForm(true)}
                        className="nutrition-button primary"
                      >
                        Create New Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="nutrition-button primary"
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlans;
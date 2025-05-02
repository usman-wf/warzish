import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MealPlanCard from '../../components/MealPlanCard';
import MealPlanForm from '../../components/MealPlanForm';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3030';

const MealPlans = () => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
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
          
          setMealPlans(Array.isArray(plansData) ? plansData : []);
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
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleCreatePlan = async (planData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to create meal plans');
        navigate('/login');
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/food/plan`, planData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const newPlan = response.data.data || response.data;
      
      setMealPlans(prev => [...prev, newPlan]);
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
      
      toast.error(error.response?.data?.message || 'Failed to create meal plan');
    }
  };

  const handleUpdatePlan = async (planId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update meal plans');
        navigate('/login');
        return;
      }
      
      const response = await axios.put(`${API_BASE_URL}/food/plan/${planId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const updatedPlan = response.data.data || response.data;
      
      setMealPlans(prev => prev.map(plan => 
        plan._id === planId ? updatedPlan : plan
      ));
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
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete meal plans');
        navigate('/login');
        return;
      }
      
      await axios.delete(`${API_BASE_URL}/food/plan/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMealPlans(prev => prev.filter(plan => plan._id !== planId));
      toast.success('Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to delete meal plan');
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

  // Check if user is authenticated for conditional rendering
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('token');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meal Plans</h1>
        {isAuthenticated ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create New Plan
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login to Create Plans
          </button>
        )}
      </div>
      
      {showForm && isAuthenticated && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <MealPlanForm 
            foods={foods}
            onSubmit={handleCreatePlan}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      {!isAuthenticated ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">
            You need to login to create and manage meal plans. Browse the food database to see what&apos;s available.
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
      ) : mealPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No meal plans found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map(plan => (
            <MealPlanCard 
              key={plan._id} 
              plan={plan} 
              foods={foods}
              onUpdate={handleUpdatePlan}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// export default MealPlans;
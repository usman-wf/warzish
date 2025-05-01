import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MealPlanCard from '../../components/MealPlanCard';
import MealPlanForm from '../../components/MealPlanForm';

const MealPlans = () => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [plansRes, foodsRes] = await Promise.all([
          axios.get('http://localhost:3030/food/plan', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3030/food/food', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setMealPlans(plansRes.data);
        setFoods(foodsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleCreatePlan = async (planData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3030/food/plan', planData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMealPlans(prev => [...prev, response.data]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meal Plans</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create New Plan
        </button>
      </div>
      
      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <MealPlanForm 
            foods={foods}
            onSubmit={handleCreatePlan}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      {mealPlans.length === 0 ? (
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlans;
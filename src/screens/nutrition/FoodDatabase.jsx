// src/pages/nutrition/FoodDatabase.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../../components/FoodCard';
import SearchFilter from '../../components/SearchFilter';
import { toast } from 'react-toastify';
import './MealLog.css';

const API_BASE_URL = 'http://localhost:3030';

const FoodDatabase = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token if available
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log('Fetching foods from API');
        const response = await axios.get(`${API_BASE_URL}/food/food`, {
          headers
        });
        
        console.log('API response:', response.data);
        
        // Extract foods from response - handle different response formats
        let foodsData = [];
        if (response.data.foods && Array.isArray(response.data.foods)) {
          foodsData = response.data.foods;
        } else if (Array.isArray(response.data)) {
          foodsData = response.data;
        }
        
        console.log(`Processed ${foodsData.length} foods from API`);
        
        setFoods(foodsData);
        setFilteredFoods(foodsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching foods:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load foods');
        toast.error('Error loading foods: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = foods.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFoods(results);
    } else {
      setFilteredFoods(foods);
    }
  }, [searchTerm, foods]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Food Database</h1>
      
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredFoods.map(food => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm 
              ? "No foods found matching your search" 
              : "No foods available. Try adding some!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodDatabase;
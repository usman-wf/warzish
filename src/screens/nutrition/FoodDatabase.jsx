// src/pages/nutrition/FoodDatabase.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FoodCard from '../../components/FoodCard';
import { toast } from 'react-toastify';
import '../../styles/ComponentTheme.css';
import './NutritionTheme.css';
import Sidebar from '../../components/Sidebar';

const API_BASE_URL = 'http://localhost:3030';

const FoodDatabase = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
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
  }, [navigate]);

  useEffect(() => {
    if (!Array.isArray(foods)) {
      setFilteredFoods([]);
      return;
    }
    
    let results = foods;
    
    if (searchTerm) {
      results = results.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      results = results.filter(food => 
        food.category === categoryFilter
      );
    }
    
    setFilteredFoods(results);
  }, [searchTerm, categoryFilter, foods]);

  // Extract unique categories for the filter
  const categories = foods && Array.isArray(foods) 
    ? [...new Set(foods.map(food => food.category).filter(Boolean))] 
    : [];

  if (loading) {
    return (
      <div className="nutrition-layout">
        <Sidebar />
        <div className="nutrition-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading food database...</p>
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

  return (
    <div className="nutrition-layout">
      <Sidebar />
      <div className="nutrition-main">
        <div className="nutrition-header">
          <h1>Food Database</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/nutrition/calorie-tracking')}
              className="nutrition-button secondary"
            >
              Track Calories
            </button>
            <button 
              onClick={() => navigate('/nutrition/meal-plans')}
              className="nutrition-button primary"
            >
              View Meal Plans
            </button>
          </div>
        </div>
        
        <div className="nutrition-container">
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="search">Search Foods</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
              
              {categories.length > 0 && (
                <div className="filter-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-control"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {filteredFoods.length > 0 ? (
            <div className="nutrition-grid">
              {filteredFoods.map(food => (
                <FoodCard 
                  key={food._id || food.id} 
                  food={food}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                {searchTerm || categoryFilter !== 'all'
                  ? "No foods found matching your search" 
                  : "No foods available. Try adding some!"}
              </p>
              <div className="empty-actions">
                {(searchTerm || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                    }}
                    className="nutrition-button secondary"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => navigate('/nutrition/calorie-tracking')}
                  className="nutrition-button primary"
                >
                  Track Calories
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDatabase;
// src/pages/nutrition/FoodDatabase.js
import   { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../../components/FoodCard';
import SearchFilter from '../../components/SearchFilter';

const FoodDatabase = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:3030/food/food');
        setFoods(response.data);
        setFilteredFoods(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching foods:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Food Database</h1>
      
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredFoods.map(food => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
      
      {!loading && filteredFoods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No foods found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default FoodDatabase;
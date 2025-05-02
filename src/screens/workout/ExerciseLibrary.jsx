// src/pages/workout/ExerciseLibrary.js
import   { useState, useEffect } from 'react';
import axios from 'axios';
import ExerciseCard from '../../components/ExerciseCard';
import SearchFilter from '../../components/SearchFilter';

const API_BASE_URL = 'http://localhost:3030';

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/exercise/exercises`);
        setExercises(response.data);
        setFilteredExercises(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    let results = exercises;
    
    if (searchTerm) {
      results = results.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (muscleGroupFilter !== 'all') {
      results = results.filter(exercise => 
        exercise.muscleGroup === muscleGroupFilter
      );
    }
    
    if (equipmentFilter !== 'all') {
      results = results.filter(exercise => 
        exercise.equipment === equipmentFilter
      );
    }
    
    setFilteredExercises(results);
  }, [searchTerm, muscleGroupFilter, equipmentFilter, exercises]);

  const muscleGroups = [...new Set(exercises.map(ex => ex.muscleGroup))];
  const equipmentTypes = [...new Set(exercises.map(ex => ex.equipment))];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exercise Library</h1>
      
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: 'Muscle Group',
            options: ['all', ...muscleGroups],
            value: muscleGroupFilter,
            onChange: setMuscleGroupFilter
          },
          {
            label: 'Equipment',
            options: ['all', ...equipmentTypes],
            value: equipmentFilter,
            onChange: setEquipmentFilter
          }
        ]}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredExercises.map(exercise => (
            <ExerciseCard key={exercise._id} exercise={exercise} />
          ))}
        </div>
      )}
      
      {!loading && filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No exercises found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
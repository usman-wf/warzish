import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3030';

const CollaborativeGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'workout_frequency',
    target: '',
    unit: '',
    startDate: '',
    endDate: '',
    participants: [],
    visibility: 'public'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

      if (!isAuthenticated || !token) {
        toast.error('Please log in to view collaborative goals');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/social/goals`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setGoals(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching goals:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      setError('Failed to load goals');
      toast.error('Failed to load goals');
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to create goals');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/social/goals`,
        {
          ...newGoal,
          visibility: 'public'
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setShowCreateForm(false);
      setNewGoal({
        title: '',
        description: '',
        type: 'workout_frequency',
        target: '',
        unit: '',
        startDate: '',
        endDate: '',
        participants: [],
        visibility: 'public'
      });
      toast.success('Goal created successfully');
      fetchGoals();
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error('Failed to create goal');
    }
  };

  const handleUpdateProgress = async (goalId, progress) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update progress');
        navigate('/login');
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/social/goals/${goalId}/progress`,
        { progress },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      toast.success('Progress updated successfully');
      fetchGoals();
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Failed to update progress');
    }
  };

  const handleUpdateStatus = async (goalId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update status');
        navigate('/login');
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/social/goals/${goalId}/status`,
        { status },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      toast.success('Status updated successfully');
      fetchGoals();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-center p-4">Loading goals...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Collaborative Goals</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Create New Goal
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="workout_frequency">Workout Frequency</option>
                  <option value="distance">Distance</option>
                  <option value="duration">Duration</option>
                  <option value="weight">Weight</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target</label>
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <select
                  value={newGoal.visibility}
                  onChange={(e) => setNewGoal({ ...newGoal, visibility: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Goals are public by default to encourage community participation</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{goal.title}</h3>
                <p className="text-gray-600">{goal.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                goal.status === 'active' ? 'bg-green-100 text-green-800' :
                goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {goal.status}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                {format(new Date(goal.startDate), 'MMM d, yyyy')} - {format(new Date(goal.endDate), 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-500">
                Target: {goal.target} {goal.unit}
              </p>
            </div>

            <div className="space-y-2">
              {goal.participants.map((participant) => (
                <div key={participant.user._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={participant.user.profilePicture || '/default-avatar.png'}
                      alt={participant.user.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{participant.user.username}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(participant.progress / goal.target) * 100}%` }}
                      />
                    </div>
                    <span>{participant.progress} / {goal.target}</span>
                    {participant.status === 'invited' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(goal._id, 'accepted')}
                          className="text-green-500 hover:text-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(goal._id, 'declined')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {goal.status === 'active' && (
              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Update progress..."
                  className="w-full p-2 border rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleUpdateProgress(goal._id, parseFloat(e.target.value));
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeGoals; 
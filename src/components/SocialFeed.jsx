import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3030';

const SocialFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareForm, setShowShareForm] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [visibility, setVisibility] = useState('public');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
    fetchUserWorkouts();
  }, []);

  const fetchUserWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/exercise/workout`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setWorkouts(response.data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
    }
  };

  const handleShareWorkout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to share workouts');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/social/workouts/share`,
        {
          workoutId: selectedWorkout,
          visibility: visibility
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      toast.success('Workout shared successfully');
      setShowShareForm(false);
      setSelectedWorkout('');
      setVisibility('public');
      fetchActivities();
    } catch (err) {
      console.error('Error sharing workout:', err);
      toast.error('Failed to share workout');
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

      if (!isAuthenticated || !token) {
        toast.error('Please log in to view the activity feed');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/social/workouts/feed`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setActivities(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      setError('Failed to load activities');
      toast.error('Failed to load activities');
      setLoading(false);
    }
  };

  const handleLike = async (sharedWorkoutId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to like workouts');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/social/workouts/${sharedWorkoutId}/like`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      fetchActivities(); // Refresh the feed
    } catch (err) {
      console.error('Error liking workout:', err);
      toast.error('Failed to like workout');
    }
  };

  const handleComment = async (sharedWorkoutId, content) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to comment');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/social/workouts/${sharedWorkoutId}/comment`,
        { content },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      fetchActivities(); // Refresh the feed
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    }
  };

  if (loading) return <div className="text-center p-4">Loading activities...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Activity Feed</h2>
        <button
          onClick={() => setShowShareForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Share Workout
        </button>
      </div>

      {showShareForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Share a Workout</h3>
            <form onSubmit={handleShareWorkout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Workout</label>
                <select
                  value={selectedWorkout}
                  onChange={(e) => setSelectedWorkout(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Choose a workout...</option>
                  {workouts.map((workout) => (
                    <option key={workout._id} value={workout._id}>
                      {workout.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="public">Public</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowShareForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <img
                src={activity.sharedBy.profilePicture || '/default-avatar.png'}
                alt={activity.sharedBy.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{activity.sharedBy.username}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <h3 className="font-semibold">{activity.originalWorkout.name}</h3>
              <p className="text-gray-600">{activity.originalWorkout.description}</p>
            </div>

            <div className="flex items-center space-x-4 mb-3">
              <button
                onClick={() => handleLike(activity._id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
              >
                <span>❤️</span>
                <span>{activity.likes.length}</span>
              </button>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{activity.comments.length} comments</span>
            </div>

            <div className="space-y-2">
              {activity.comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2">
                  <img
                    src={comment.user.profilePicture || '/default-avatar.png'}
                    alt={comment.user.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="bg-gray-100 rounded-lg p-2 flex-1">
                    <p className="font-semibold text-sm">{comment.user.username}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleComment(activity._id, e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed; 
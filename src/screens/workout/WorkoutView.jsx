import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import WorkoutDetails from "../../components/WorkoutDetails";
import "../Workout.css";
import "./WorkoutTheme.css";

const API_BASE_URL = "http://localhost:3030";

const WorkoutView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("Please log in to view workout details");
          navigate("/login");
          return;
        }

        // Fetch workout details
        const response = await axios.get(`${API_BASE_URL}/exercise/workout/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && (response.data.data || response.data)) {
          const workoutData = response.data.data || response.data;
          setWorkout(workoutData);

          // Check if this workout is saved
          try {
            const savedResponse = await axios.get(`${API_BASE_URL}/exercise/workout-saved`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const savedWorkouts = savedResponse.data.data || [];
            const isAlreadySaved = savedWorkouts.some(saved => {
              const savedId = saved.workoutId || (saved.workoutPlan && saved.workoutPlan._id);
              return savedId === workoutData._id;
            });
            
            setIsSaved(isAlreadySaved);
          } catch (saveCheckError) {
            console.error("Error checking if workout is saved:", saveCheckError);
          }
        } else {
          setError("Failed to load workout details");
          toast.error("Could not load workout details");
        }
      } catch (error) {
        console.error("Error fetching workout details:", error);
        setError(error.response?.data?.message || "Failed to fetch workout details");
        toast.error("Error loading workout details");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [id, navigate]);

  const handleSaveWorkout = async (event) => {
    event.preventDefault();
    console.log("Save button clicked in WorkoutView");
    
    if (!workout || !workout._id) {
      toast.error("Cannot save workout: missing workout ID");
      return;
    }
    
    // Check if this is a sample workout (with ID like 'sample-1')
    const workoutId = workout._id;
    if (workoutId && workoutId.toString().startsWith('sample-')) {
      toast.warning('Sample workouts cannot be saved. Real workouts can be saved once you create them!');
      return;
    }

    try {
      setIsSaving(true);
      toast.info("Saving workout...");
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setIsSaving(false);
        return;
      }
      
      console.log("Saving workout with ID:", workout._id);
      console.log("Request headers:", { Authorization: `Bearer ${token.substring(0, 10)}...` });
      console.log("Request payload:", { workoutPlanId: workout._id });
      
      const response = await axios.post(
        `${API_BASE_URL}/exercise/workout-saved`,
        { workoutPlanId: workout._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Save response:", response.data);
      setIsSaved(true);
      toast.success("Workout saved successfully");
    } catch (error) {
      console.error("Error saving workout:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        
        // Handle specific error cases
        if (error.response.status === 400 && 
            error.response.data?.message?.includes('already saved')) {
          toast.info('You have already saved this workout');
          setIsSaved(true);
        } else if (error.response.status === 400 && 
            error.response.data?.message?.includes('Cast to ObjectId failed')) {
          toast.warning('This sample workout cannot be saved. Create your own workouts instead!');
        } else {
          toast.error(`Failed to save: ${error.response.data.message || error.response.statusText}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Request error:", error.message);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="workout-layout">
        <Sidebar />
        <div className="workout-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="workout-layout">
        <Sidebar />
        <div className="workout-main">
          <div className="error-message">
            <p>{error || "Workout not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="workout-button primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userId = localStorage.getItem("userId");
  const isOwner = userId && workout.userId === userId;
  const isPublic = workout.isPublic;

  return (
    <div className="workout-layout">
      <Sidebar />
      <div className="workout-main">
        <div className="workout-header">
          <h1>Workout Details</h1>
          <div className="header-actions">
            {isPublic && !isOwner && !isSaved && (
              <button
                onClick={handleSaveWorkout}
                className="workout-button primary"
                disabled={isSaving}
                style={{
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? 'Saving...' : 'Save Workout'}
              </button>
            )}
            {isPublic && !isOwner && isSaved && (
              <div className="saved-status" style={{ 
                color: 'var(--Secondary-Color-Yellow)', 
                fontWeight: 'bold',
                padding: '0.75rem'
              }}>
                ✓ Workout Saved
              </div>
            )}
            <button
              onClick={() => navigate("/workout/saved-workouts")}
              className="workout-button secondary"
            >
              Back to Workout Library
            </button>
          </div>
        </div>

        <div className="workout-details-container">
          <WorkoutDetails workout={workout} />
        </div>
      </div>
    </div>
  );
};

export default WorkoutView; 
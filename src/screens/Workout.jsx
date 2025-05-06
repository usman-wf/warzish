import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import WorkoutLibrary from "../components/WorkoutLibrary";
import PersonalWorkouts from "../components/PersonalWorkouts";
import SavedWorkoutsTab from "../components/SavedWorkoutsTab";
import WorkoutDetails from "../components/WorkoutDetails";
import Modal from "react-modal";
import { toast } from "react-toastify";
import './Workout.css';

const API_BASE_URL = 'http://localhost:3030';

const Workout = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Library");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuthenticated || !token) {
            toast.error('Please log in to access workouts');
            navigate('/login');
            return;
        }

        // Log token details for debugging
        try {
            console.log('Token from localStorage:', token.substring(0, 20) + '...');
            // Decode JWT without verification to check its structure (frontend only)
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('Token payload:', payload);
                console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
                const isExpired = payload.exp * 1000 < Date.now();
                console.log('Token expired?', isExpired);
                
                if (isExpired) {
                    toast.error('Your session has expired. Please log in again.');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                // Make sure userId is available in localStorage for future API calls
                if (payload.userId && !localStorage.getItem('userId')) {
                    localStorage.setItem('userId', payload.userId);
                    console.log('Set userId in localStorage:', payload.userId);
                }
            } else {
                console.error('Invalid token format (not a JWT)');
            }
        } catch (e) {
            console.error('Error decoding token:', e);
        }

        const fetchWorkouts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Use clean token without any potential whitespace
                const cleanToken = token.trim();

                console.log('Making API request to:', `${API_BASE_URL}/exercise/workout`);
                console.log('Auth header:', `Bearer ${cleanToken.substring(0, 20)}...`);
                
                // Use sample workouts first to ensure basic UI works
                const sampleWorkouts = [
                    {
                        id: 'sample-1',
                        title: 'Full Body Blast',
                        category: "Strength",
                        duration: "45 minutes",
                        difficulty: "Intermediate",
                        rating: 4.5,
                        creator: "FitnessPro",
                        description: "A comprehensive full body workout for intermediate fitness enthusiasts."
                    },
                    {
                        id: 'sample-2',
                        title: 'HIIT Cardio',
                        category: "Cardio",
                        duration: "30 minutes",
                        difficulty: "Advanced",
                        rating: 4.8,
                        creator: "CardioKing",
                        description: "High-intensity interval training to maximize calorie burn and improve cardiovascular fitness."
                    },
                    {
                        id: 'sample-3',
                        title: 'Yoga Flow',
                        category: "Yoga",
                        duration: "60 minutes",
                        difficulty: "Beginner",
                        rating: 4.2,
                        creator: "ZenMaster",
                        description: "A calming yoga flow to improve flexibility, balance and mental clarity."
                    }
                ];
                
                // Set sample workouts first so UI is responsive
                setWorkouts(sampleWorkouts);
                
                try {
                    // First, try to verify the token
                    console.log('Verifying token validity...');
                    let validToken = false;
                    
                    try {
                        // Fix: Use the correct endpoint without /api prefix
                        const verifyResponse = await axios.get(`${API_BASE_URL}/verify-token`, {
                            headers: { 
                                'Authorization': `Bearer ${cleanToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (verifyResponse.status === 200) {
                            console.log('Token is valid!', verifyResponse.data);
                            validToken = true;
                            
                            // Set userId in localStorage if not already set
                            if (verifyResponse.data.user && verifyResponse.data.user.id) {
                                localStorage.setItem('userId', verifyResponse.data.user.id);
                                console.log('Updated userId in localStorage:', verifyResponse.data.user.id);
                            }
                        }
                    } catch (verifyError) {
                        console.error('Token verification failed:', verifyError.response?.data || verifyError.message);
                        
                        if (verifyError.response?.status === 401) {
                            console.log('Token is invalid or expired, attempting to refresh...');
                        }
                    }
                    
                    // Try manually re-logging in to refresh the token if needed
                    if (!validToken) {
                        try {
                            // This is a debugging step - check if we have email/password stored for demo purposes
                            const testEmail = localStorage.getItem('debugEmail');
                            const testPassword = localStorage.getItem('debugPassword');
                            
                            if (testEmail && testPassword) {
                                console.log('Attempting to refresh token with stored credentials');
                                const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
                                    email: testEmail,
                                    password: testPassword
                                });
                                
                                if (loginResponse.data && loginResponse.data.token) {
                                    const newToken = loginResponse.data.token;
                                    console.log('Got new token:', newToken.substring(0, 20) + '...');
                                    localStorage.setItem('token', newToken);
                                    localStorage.setItem('isAuthenticated', 'true');
                                    
                                    // Store user ID from response
                                    if (loginResponse.data.user && loginResponse.data.user.id) {
                                        localStorage.setItem('userId', loginResponse.data.user.id);
                                        console.log('Set userId from login response:', loginResponse.data.user.id);
                                    }
                                    
                                    console.log('Updated token in localStorage');
                                }
                            } else {
                                console.log('No debug credentials available for token refresh');
                            }
                        } catch (loginErr) {
                            console.error('Auto-refresh token attempt failed:', loginErr);
                        }
                    }
                    
                    // Ensure userId is in localStorage for the API call
                    const userId = localStorage.getItem('userId');
                    if (!userId) {
                        console.warn('No userId found in localStorage, API calls will likely fail');
                    } else {
                        console.log('Using userId from localStorage:', userId);
                    }
                    
                    // Then try to fetch real workouts from API
                    const response = await axios.get(`${API_BASE_URL}/exercise/workout`, {
                        headers: { 
                            'Authorization': `Bearer ${cleanToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
    
                    console.log('Workout response:', response.data);
    
                    // Handle both direct array response and object with data property
                    const responseData = Array.isArray(response.data) 
                        ? response.data 
                        : response.data?.data || [];
    
                    if (responseData.length > 0) {
                        // Only update if we got actual data
                        const formattedWorkouts = responseData.map(workout => ({
                            ...workout,
                            id: workout._id || workout.id || Math.random().toString(36).substring(2, 9),
                            title: workout.name || workout.title,
                            exercises: workout.exercises || [],
                            // Add isOwner flag based on userId or creator field
                            isOwner: workout.userId === localStorage.getItem('userId') || 
                                   (workout.creator && workout.creator === "You")
                        }));
    
                        console.log('Formatted workouts:', formattedWorkouts);
                        setWorkouts(formattedWorkouts);
                    }
                } catch (apiError) {
                    console.error('Error fetching workouts from API:', apiError);
                    
                    if (apiError.response) {
                        console.error('Response status:', apiError.response.status);
                        console.error('Response data:', apiError.response.data);
                    }
                    
                    // Keep using sample workouts, no need to navigate away
                    // We're already showing something to the user
                    
                    if (apiError.response?.status === 401) {
                        toast.warning('Authentication issues. Using sample workouts instead.');
                    } else {
                        toast.warning('Using sample workouts - Could not connect to server');
                    }
                }
                
                setError(null);
            } catch (error) {
                console.error('Error in workout component:', error);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };
        
        fetchWorkouts();
    }, [navigate]);

    const handleTabChange = (tab) => setActiveTab(tab);

    const openModal = (workout) => {
        setSelectedWorkout(workout);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setSelectedWorkout(null);
        setModalIsOpen(false);
    };

    const deleteWorkout = async (workoutId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }
            
            await axios.delete(`${API_BASE_URL}/exercise/workout/${workoutId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update state after successful deletion
            setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
            toast.success('Workout deleted successfully');
            
            // Close modal if the deleted workout was being viewed
            if (selectedWorkout && selectedWorkout.id === workoutId) {
                closeModal();
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
            toast.error('Failed to delete workout: ' + (error.response?.data?.message || error.message));
        }
    };

    const renderTabContent = () => {
        if (loading) {
            return <div className="loading-container"><div className="loading-spinner"></div></div>;
        }

        if (error) {
            return (
                <div className="error-message">
                    <p>Error loading workouts: {error}</p>
                    <p>Showing sample data instead</p>
                </div>
            );
        }

        // Get user ID outside of switch statement
        const userId = localStorage.getItem('userId');
        
        // Calculate personal workouts outside of switch
        const personalWorkouts = workouts.filter(w => {
            return (w.userId && w.userId === userId) || 
                   w.isOwner || 
                   (w.creator && (w.creator === "You" || w.creator === userId));
        });
        
        console.log('Personal workouts:', personalWorkouts);

        switch (activeTab) {
            case "Library":
                return <WorkoutLibrary workouts={workouts} clicked={openModal} />;
            case "Personal":
                return <PersonalWorkouts workouts={personalWorkouts} clicked={openModal} />;
            case "Saved":
                return <SavedWorkoutsTab clicked={openModal} />;
            default:
                return null;
        }
    };

    return (
        <div className="workout-layout">
            <Sidebar />
            <div className="workout-main">
                <div className="WorkoutHeader">
                    <h1>Your Workout Plans</h1>
                    <Link to="/workout/create" className="CreateWorkoutButton">
                        <span>Create New Workout</span>
                    </Link>
                </div>
        
                <div className="WorkoutNav">
                    {["Library", "Personal", "Saved"].map((tab) => (
                        <div
                            key={tab}
                            className={`WorkoutNavItem ${activeTab === tab ? "Active" : "Inactive"}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab === "Library" && "Workout Library"}
                            {tab === "Personal" && "Personal Workouts"}
                            {tab === "Saved" && "Saved Workouts"}
                        </div>
                    ))}
                </div>
        
                <div className="WorkoutContent">
                    {renderTabContent()}
                </div>
        
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Workout Details"
                    ariaHideApp={false}
                >
                    <div className="modal-header">
                        <h2>Workout Details</h2>
                        <button onClick={closeModal} className="modal-close-button">
                            Close
                        </button>
                    </div>
                    <div className="modal-body">
                        {selectedWorkout && <WorkoutDetails workout={selectedWorkout} />}
                    </div>
                    <div className="modal-footer">
                        {selectedWorkout && (
                            <>
                                <button 
                                    className="modal-delete-button" 
                                    onClick={() => {
                                        deleteWorkout(selectedWorkout.id);
                                        // closeModal() will be called after deletion in the deleteWorkout function
                                    }}
                                >
                                    Delete Workout
                                </button>
                                <Link to={`/workout/create?edit=${selectedWorkout.id}`} className="modal-action-button">
                                    Edit Workout
                                </Link>
                            </>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Workout;
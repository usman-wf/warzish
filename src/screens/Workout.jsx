import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
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
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('token');
        if (!isAuthenticated) {
            toast.error('Please log in to access workouts');
            navigate('/login');
            return;
        }

        const fetchWorkouts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                console.log('Fetching workouts with token:', token);
                const response = await axios.get(`${API_BASE_URL}/exercise/workout`, {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                });

                console.log('Workout response:', response.data);

                // Handle both direct array response and object with data property
                const responseData = Array.isArray(response.data) 
                    ? response.data 
                    : response.data?.data || [];

                // Ensure each workout has an id field
                const formattedWorkouts = responseData.map(workout => ({
                    ...workout,
                    id: workout._id || workout.id || Math.random().toString(36).substring(2, 9),
                    title: workout.name || workout.title,
                    exercises: workout.exercises || []
                }));

                setWorkouts(formattedWorkouts);
                setError(null);
            } catch (error) {
                console.error('Error fetching workouts:', error);
                
                // Handle authentication errors
                if (error.response?.status === 401) {
                    toast.error('Your session has expired. Please log in again.');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                
                setError(error.response?.data?.message || error.message || 'Failed to load workouts');
                toast.error('Error loading workouts: ' + (error.response?.data?.message || error.message));
                
                // Fallback to sample data only if there are no workouts
                if (workouts.length === 0) {
                    setWorkouts([
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
                    ]);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchWorkouts();
    }, [navigate, workouts.length]);

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
                headers: { 'Authorization': `Bearer ${token}` }
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

        switch (activeTab) {
            case "Library":
                return <WorkoutLibrary workouts={workouts} clicked={openModal} />;
            case "Personal":
                return <PersonalWorkouts clicked={openModal} />;
            case "Saved":
                return <SavedWorkoutsTab clicked={openModal} />;
            default:
                return null;
        }
    };

    return (
        <div className="Workout">
            <Navbar />
            <div className="WorkoutHero">
                <div className="WorkoutHeader">
                    <h1>Your Workout Plans</h1>
                    <Link to="/workout-creator" className="CreateWorkoutButton">
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
                                <Link to={`/workout-creator?edit=${selectedWorkout.id}`} className="modal-action-button">
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